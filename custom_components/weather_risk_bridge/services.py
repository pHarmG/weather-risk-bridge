"""Services for smoother location (coordinate) updates.

``resolve_location`` turns a place name into coordinate candidates and
``update_location`` applies new coordinates (manual, Home Assistant's own
location, or a search match) to an existing location without driving the
config-entry flow by hand.
"""

from __future__ import annotations

import asyncio
import functools
import logging
from contextlib import suppress
from typing import Any

import voluptuous as vol

from aiohttp import ClientError
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
    callback,
)
from homeassistant.exceptions import ServiceValidationError, Unauthorized
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers import config_validation as cv

from .api import WeatherRiskBridgeClient
from .const import (
    ATTR_LOCATIONS,
    CONF_BEARER_TOKEN,
    CONF_LABEL,
    CONF_LATITUDE,
    CONF_LOCATION_KEY,
    CONF_LONGITUDE,
    CONF_SERVICE_URL,
    CONF_WIND_THRESHOLD_MPH,
    DOMAIN,
    SERVICE_RESOLVE_LOCATION,
    SERVICE_UPDATE_LOCATION,
)
from .geocoding import GeocodingError, async_search_locations
from .helpers import entry_slug_from_config, entry_title_from_config, merge_entry_config

LOGGER = logging.getLogger(__name__)

ATTR_ENTRY_ID = "entry_id"
ATTR_LOCATION = "location"
ATTR_QUERY = "query"
ATTR_RESULT = "result"
ATTR_USE_HOME_ASSISTANT = "use_home_assistant"

RESOLVE_LOCATION_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_QUERY): cv.string,
    }
)

UPDATE_LOCATION_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_LOCATION): cv.string,
        vol.Optional(ATTR_ENTRY_ID): cv.string,
        vol.Optional(CONF_LATITUDE): vol.Coerce(float),
        vol.Optional(CONF_LONGITUDE): vol.Coerce(float),
        vol.Optional(ATTR_USE_HOME_ASSISTANT): cv.boolean,
        vol.Optional(ATTR_QUERY): cv.string,
        vol.Optional(ATTR_RESULT, default=1): vol.All(
            vol.Coerce(int), vol.Range(min=1)
        ),
        vol.Optional(CONF_LABEL): cv.string,
    }
)


def _find_entry(hass: HomeAssistant, call: ServiceCall) -> ConfigEntry:
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        raise ServiceValidationError("No Weather Risk Suite locations are configured")

    entry_id = call.data.get(ATTR_ENTRY_ID)
    if entry_id:
        for entry in entries:
            if entry.entry_id == entry_id:
                return entry
        raise ServiceValidationError(
            f"No Weather Risk Suite location with entry id {entry_id}"
        )

    location = str(call.data.get(ATTR_LOCATION) or "").strip()
    if location:
        wanted = location.lower()
        for entry in entries:
            config = merge_entry_config(entry)
            if (
                entry_slug_from_config(config) == wanted
                # location_key is the alias the entry was last targeted by;
                # label-less entries derive their slug from the coordinates,
                # which change on update while entity ids keep the old slug.
                or str(config.get(CONF_LOCATION_KEY) or "") == wanted
                or (entry.title or "").strip().lower() == wanted
            ):
                return entry
        raise ServiceValidationError(
            f"No Weather Risk Suite location matches '{location}'"
        )

    if len(entries) == 1:
        return entries[0]
    raise ServiceValidationError(
        "Multiple Weather Risk Suite locations exist; specify 'location' or 'entry_id'"
    )


def _validate_coordinates(latitude: float, longitude: float) -> None:
    if not -90 <= latitude <= 90:
        raise ServiceValidationError(f"Latitude {latitude} is out of range (-90..90)")
    if not -180 <= longitude <= 180:
        raise ServiceValidationError(
            f"Longitude {longitude} is out of range (-180..180)"
        )


async def _async_resolve_coordinates(hass: HomeAssistant, call: ServiceCall) -> tuple[float, float] | None:
    """Return (latitude, longitude) for the manual/home/search request."""
    data = call.data
    if data.get(ATTR_USE_HOME_ASSISTANT):
        return hass.config.latitude, hass.config.longitude
    if CONF_LATITUDE in data or CONF_LONGITUDE in data:
        if CONF_LATITUDE not in data or CONF_LONGITUDE not in data:
            raise ServiceValidationError(
                "Provide both latitude and longitude (or neither)"
            )
        return float(data[CONF_LATITUDE]), float(data[CONF_LONGITUDE])
    query = str(data.get(ATTR_QUERY) or "").strip()
    if query:
        try:
            candidates = await async_search_locations(hass, None, query)
        except GeocodingError as err:
            raise ServiceValidationError(f"Location search failed: {err}") from err
        if not candidates:
            raise ServiceValidationError(f"No matches found for '{query}'")
        index = int(data.get(ATTR_RESULT, 1)) - 1
        if index >= len(candidates):
            raise ServiceValidationError(
                f"'{query}' returned {len(candidates)} matches; "
                f"'result' must be between 1 and {len(candidates)}"
            )
        candidate = candidates[index]
        return candidate["latitude"], candidate["longitude"]
    return None


async def _async_resolve_location(hass: HomeAssistant, call: ServiceCall) -> ServiceResponse:
    query = str(call.data.get(ATTR_QUERY) or "").strip()
    try:
        candidates = await async_search_locations(hass, None, query)
    except GeocodingError as err:
        raise ServiceValidationError(f"Location search failed: {err}") from err
    return {ATTR_LOCATIONS: candidates}


async def _async_ensure_admin(hass: HomeAssistant, call: ServiceCall) -> None:
    """Restrict configuration changes to administrators.

    Identified users must be admins; unauthenticated system contexts (e.g.
    automations run by Home Assistant itself) are allowed through, matching
    how core treats machine-originated service calls.
    """
    user_id = call.context.user_id
    if not user_id:
        return
    user = await hass.auth.async_get_user(user_id)
    if user is None or not user.is_admin:
        raise Unauthorized(context=call.context)


# Serialize update_location per entry: snapshot -> commit -> reload must be
# atomic, or an overlapping call's rollback could restore stale configuration
# over another call's successful update.
_entry_update_locks: dict[str, asyncio.Lock] = {}


def _entry_update_lock(entry_id: str) -> asyncio.Lock:
    lock = _entry_update_locks.get(entry_id)
    if lock is None:
        lock = asyncio.Lock()
        _entry_update_locks[entry_id] = lock
    return lock


async def _async_update_location(hass: HomeAssistant, call: ServiceCall) -> ServiceResponse:
    await _async_ensure_admin(hass, call)
    entry = _find_entry(hass, call)
    coordinates = await _async_resolve_coordinates(hass, call)
    if coordinates is None:
        raise ServiceValidationError(
            "Provide latitude/longitude, use_home_assistant, or a search query"
        )
    latitude, longitude = coordinates
    _validate_coordinates(latitude, longitude)

    # Serialize the snapshot/commit/reload window per entry so an overlapping
    # call cannot interleave (and a failed reload's rollback cannot restore
    # stale configuration over another call's successful update).
    async with _entry_update_lock(entry.entry_id):
        return await _async_commit_location_update(
            hass, entry, call, latitude, longitude
        )


async def _async_commit_location_update(
    hass: HomeAssistant,
    entry: ConfigEntry,
    call: ServiceCall,
    latitude: float,
    longitude: float,
) -> ServiceResponse:
    config_before = merge_entry_config(entry)

    # Validate the replacement location against the weather service before
    # committing: valid coordinates outside NWS coverage would otherwise fail
    # the reload and leave the previously working location unavailable.
    try:
        session = async_get_clientsession(hass)
        client = WeatherRiskBridgeClient(
            session=session,
            service_url=config_before[CONF_SERVICE_URL],
            bearer_token=config_before.get(CONF_BEARER_TOKEN) or None,
        )
        await client.async_snapshot(
            latitude=latitude,
            longitude=longitude,
            label=config_before.get(CONF_LABEL) or None,
            wind_threshold_mph=int(config_before[CONF_WIND_THRESHOLD_MPH]),
        )
    except ClientError as err:
        LOGGER.warning(
            "Weather Risk Suite update_location rejected coordinates %s, %s: %s",
            latitude,
            longitude,
            err,
        )
        raise ServiceValidationError(
            "The weather service could not provide data for these coordinates "
            "(US locations only). Nothing was changed."
        ) from err
    except Exception as err:
        raise ServiceValidationError(
            f"Validating the new location failed: {err}. Nothing was changed."
        ) from err

    updates: dict[str, Any] = {
        CONF_LATITUDE: latitude,
        CONF_LONGITUDE: longitude,
    }
    label = str(call.data.get(CONF_LABEL) or "").strip()
    if label:
        updates[CONF_LABEL] = label

    # Record a stable targeting alias. Label-less entries derive their slug
    # from the coordinates, so their entity ids and the card's location key
    # keep the pre-update slug after coordinates change. Initialize the alias
    # from the pre-update slug (never the caller's string, which may be a
    # title rather than a slug) and never overwrite an existing alias, so the
    # key the card uses stays valid across updates.
    existing_alias = str(config_before.get(CONF_LOCATION_KEY) or "").strip().lower()
    updates[CONF_LOCATION_KEY] = (
        existing_alias or entry_slug_from_config(config_before)
    )

    # Snapshot everything so a failed reload can restore the working config.
    previous_data = dict(entry.data)
    previous_options = dict(entry.options)
    previous_title = entry.title

    # Keep the update in whichever store currently owns the coordinates so
    # options flow settings are not shadowed by entry data (merge precedence).
    if CONF_LATITUDE in entry.options or CONF_LONGITUDE in entry.options:
        new_options = {**entry.options, **updates}
        hass.config_entries.async_update_entry(entry, options=new_options)
    else:
        new_data = {**entry.data, **updates}
        hass.config_entries.async_update_entry(entry, data=new_data)

    new_config = merge_entry_config(entry)
    new_title = entry_title_from_config(new_config)
    if new_title != entry.title:
        hass.config_entries.async_update_entry(entry, title=new_title)

    LOGGER.info(
        "Updated Weather Risk Suite location '%s' to %s, %s; reloading",
        new_title,
        latitude,
        longitude,
    )
    try:
        reloaded = await hass.config_entries.async_reload(entry.entry_id)
    except Exception as err:
        reloaded = False
        reload_error = err
    else:
        reload_error = None
    if reloaded is False:
        # async_reload returns False (instead of raising) when unload or
        # setup fails; treat that as a failure and restore the previous config.
        hass.config_entries.async_update_entry(
            entry,
            data=previous_data,
            options=previous_options,
            title=previous_title,
        )
        with suppress(Exception):
            await hass.config_entries.async_reload(entry.entry_id)
        message = (
            "Reloading the location with new coordinates failed"
            f"{f': {reload_error}' if reload_error else ''}. "
            "The previous configuration was restored."
        )
        if reload_error is not None:
            raise ServiceValidationError(message) from reload_error
        raise ServiceValidationError(message)
    # Report the stored alias first: it is the key existing entity ids (and
    # therefore the card) still use for this location, even when the slug
    # itself derives from the coordinates and changed with this update.
    stored_alias = str(new_config.get(CONF_LOCATION_KEY) or "").strip().lower()
    return {
        "location": stored_alias or entry_slug_from_config(new_config),
        "title": new_title,
        CONF_LATITUDE: latitude,
        CONF_LONGITUDE: longitude,
    }


@callback
def async_register_services(hass: HomeAssistant) -> None:
    existing = hass.services.async_services().get(DOMAIN) or {}
    if SERVICE_RESOLVE_LOCATION in existing:
        return
    hass.services.async_register(
        DOMAIN,
        SERVICE_RESOLVE_LOCATION,
        functools.partial(_async_resolve_location, hass),
        schema=RESOLVE_LOCATION_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_LOCATION,
        functools.partial(_async_update_location, hass),
        schema=UPDATE_LOCATION_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
