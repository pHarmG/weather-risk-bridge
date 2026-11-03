from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from aiohttp import ClientError
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import selector
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import WeatherRiskBridgeClient
from .const import (
    CONF_BEARER_TOKEN,
    CONF_LABEL,
    CONF_LATITUDE,
    CONF_LOCATION_CHOICE,
    CONF_LOCATION_KEY,
    CONF_LOCATION_QUERY,
    CONF_LONGITUDE,
    CONF_SERVICE_URL,
    CONF_USE_HOME_ASSISTANT_LOCATION,
    CONF_WIND_THRESHOLD_MPH,
    DEFAULT_WIND_THRESHOLD_MPH,
    DOMAIN,
)
from .geocoding import GeocodingError, async_search_locations
from .helpers import entry_title_from_config, merge_entry_config
from .discovery import async_resolve_default_service_url

LOGGER = logging.getLogger(__name__)


def _build_schema(defaults: dict[str, Any]) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(CONF_SERVICE_URL, default=defaults[CONF_SERVICE_URL]): str,
            vol.Optional(CONF_BEARER_TOKEN, default=defaults.get(CONF_BEARER_TOKEN, "")): str,
            vol.Optional(CONF_LABEL, default=defaults.get(CONF_LABEL, "")): str,
            vol.Required(CONF_LATITUDE, default=defaults[CONF_LATITUDE]): vol.Coerce(float),
            vol.Required(CONF_LONGITUDE, default=defaults[CONF_LONGITUDE]): vol.Coerce(float),
            vol.Required(
                CONF_WIND_THRESHOLD_MPH,
                default=defaults[CONF_WIND_THRESHOLD_MPH],
            ): vol.In([30, 40, 50, 60]),
            vol.Optional(
                CONF_LOCATION_QUERY, description={"suggested_value": ""}
            ): str,
            vol.Optional(CONF_USE_HOME_ASSISTANT_LOCATION, default=False): bool,
        }
    )


async def _validate_input(hass, data: dict[str, Any]) -> None:
    LOGGER.info(
        "Validating Weather Risk Suite config for service %s",
        data[CONF_SERVICE_URL],
    )
    session = async_get_clientsession(hass)
    client = WeatherRiskBridgeClient(
        session=session,
        service_url=data[CONF_SERVICE_URL],
        bearer_token=(data.get(CONF_BEARER_TOKEN) or "").strip() or None,
    )
    await client.async_healthcheck()
    await client.async_snapshot(
        latitude=data[CONF_LATITUDE],
        longitude=data[CONF_LONGITUDE],
        label=data.get(CONF_LABEL) or None,
        wind_threshold_mph=int(data[CONF_WIND_THRESHOLD_MPH]),
    )


def _adopt_candidate(user_input: dict[str, Any], candidate: dict[str, Any]) -> None:
    """Apply a geocoding candidate to the pending config input."""
    user_input[CONF_LATITUDE] = candidate["latitude"]
    user_input[CONF_LONGITUDE] = candidate["longitude"]
    if not (user_input.get(CONF_LABEL) or "").strip() and candidate.get("name"):
        user_input[CONF_LABEL] = candidate["name"]


class LocationLookupMixin:
    """Shared place-name lookup for the config, options and reconfigure flows.

    The main form gains two transient helpers: ``location_query`` searches a
    place name (multiple matches show a picker step) and
    ``use_home_assistant_location`` adopts the Home Assistant coordinates.
    Neither field is persisted.
    """

    _location_candidates: list[dict[str, Any]] | None = None
    _pending_input: dict[str, Any] | None = None
    _pending_resume_step: str | None = None
    _location_query: str = ""

    async def _consume_location_helpers(
        self, user_input: dict[str, Any], resume_step: str
    ) -> str | None:
        """Apply the transient location fields.

        Returns an error key to show on the main form, or None when the input
        is ready for validation. May redirect the flow to the results step;
        ``resume_step`` is the step the results picker returns to.
        """
        self._location_query = str(user_input.pop(CONF_LOCATION_QUERY, "") or "").strip()
        if user_input.pop(CONF_USE_HOME_ASSISTANT_LOCATION, False):
            user_input[CONF_LATITUDE] = self.hass.config.latitude
            user_input[CONF_LONGITUDE] = self.hass.config.longitude
        if not self._location_query:
            return None
        try:
            candidates = await async_search_locations(self.hass, None, self._location_query)
        except GeocodingError as err:
            LOGGER.warning("Weather Risk Suite place search failed: %s", err)
            return "geocoding_failed"
        if not candidates:
            return "location_not_found"
        if len(candidates) == 1:
            _adopt_candidate(user_input, candidates[0])
            return None
        self._location_candidates = candidates
        self._pending_input = user_input
        self._pending_resume_step = resume_step
        return "__show_results__"

    def _location_results_form(self, errors: dict[str, str] | None = None):
        candidates = self._location_candidates or []
        return self.async_show_form(
            step_id="location_results",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_LOCATION_CHOICE): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=[
                                selector.SelectOptionDict(
                                    value=str(index),
                                    label=(
                                        f"{candidate['label']} "
                                        f"({candidate['latitude']}, "
                                        f"{candidate['longitude']})"
                                    ),
                                )
                                for index, candidate in enumerate(candidates)
                            ],
                            mode=selector.SelectSelectorMode.LIST,
                        )
                    )
                }
            ),
            errors=errors or {},
            description_placeholders={"query": self._location_query},
        )

    async def async_step_location_results(self, user_input: dict[str, Any] | None = None):
        """Let the user pick one of several geocoding matches."""
        candidates = self._location_candidates or []
        if not candidates:
            return self.async_abort(reason="location_not_found")
        if user_input is None or CONF_LOCATION_CHOICE not in user_input:
            return self._location_results_form()
        try:
            candidate = candidates[int(user_input[CONF_LOCATION_CHOICE])]
        except (IndexError, TypeError, ValueError):
            return self._location_results_form(errors={"base": "location_not_found"})
        pending = self._pending_input or {}
        _adopt_candidate(pending, candidate)
        self._pending_input = None
        self._location_query = ""
        resume_step = self._pending_resume_step or "user"
        self._pending_resume_step = None
        return await self._async_finish_with_location_input(pending, resume_step)

    async def _async_finish_with_location_input(
        self, user_input: dict[str, Any], resume_step: str
    ):
        raise NotImplementedError


class WeatherRiskBridgeConfigFlow(
    LocationLookupMixin, config_entries.ConfigFlow, domain=DOMAIN
):
    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        defaults = {
            CONF_SERVICE_URL: await async_resolve_default_service_url(self.hass),
            CONF_BEARER_TOKEN: "",
            CONF_LABEL: "",
            CONF_LATITUDE: self.hass.config.latitude,
            CONF_LONGITUDE: self.hass.config.longitude,
            CONF_WIND_THRESHOLD_MPH: DEFAULT_WIND_THRESHOLD_MPH,
        }
        errors: dict[str, str] = {}
        if user_input is not None:
            helper_error = await self._consume_location_helpers(user_input, "user")
            if helper_error == "__show_results__":
                return await self.async_step_location_results()
            if helper_error is None:
                try:
                    await _validate_input(self.hass, user_input)
                except ClientError as err:
                    LOGGER.warning(
                        "Weather Risk Suite config flow could not connect to %s: %s",
                        user_input[CONF_SERVICE_URL],
                        err,
                    )
                    errors["base"] = "cannot_connect"
                except Exception:
                    LOGGER.exception("Unexpected Weather Risk Suite config flow failure")
                    errors["base"] = "unknown"
                else:
                    await self.async_set_unique_id(
                        f"{user_input[CONF_LATITUDE]:.4f}:{user_input[CONF_LONGITUDE]:.4f}:{(user_input.get(CONF_LABEL) or '').strip().lower()}"
                    )
                    self._abort_if_unique_id_configured()
                    return self.async_create_entry(
                        title=entry_title_from_config(user_input),
                        data=user_input,
                    )
            else:
                errors["base"] = helper_error

        return self.async_show_form(
            step_id="user",
            data_schema=_build_schema(defaults),
            errors=errors,
        )

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None):
        entry = self._get_reconfigure_entry()
        defaults = merge_entry_config(entry)
        errors: dict[str, str] = {}
        if user_input is not None:
            helper_error = await self._consume_location_helpers(user_input, "reconfigure")
            if helper_error == "__show_results__":
                return await self.async_step_location_results()
            if helper_error is None:
                try:
                    await _validate_input(self.hass, user_input)
                except ClientError as err:
                    LOGGER.warning(
                        "Weather Risk Suite reconfigure could not connect to %s: %s",
                        user_input[CONF_SERVICE_URL],
                        err,
                    )
                    errors["base"] = "cannot_connect"
                except Exception:
                    LOGGER.exception("Unexpected Weather Risk Suite reconfigure failure")
                    errors["base"] = "unknown"
                else:
                    # Preserve the stable location alias: update_location may
                    # have stored it in options/data, and the form input can
                    # never contain that hidden field.
                    preserved_alias = merge_entry_config(entry).get(CONF_LOCATION_KEY)
                    data = dict(user_input)
                    if preserved_alias and CONF_LOCATION_KEY not in data:
                        data[CONF_LOCATION_KEY] = preserved_alias
                    self.hass.config_entries.async_update_entry(
                        entry,
                        data=data,
                        title=entry_title_from_config(user_input),
                    )
                    return self.async_abort(reason="reconfigure_successful")
            else:
                errors["base"] = helper_error

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=_build_schema(defaults),
            errors=errors,
        )

    async def _async_finish_with_location_input(
        self, user_input: dict[str, Any], resume_step: str
    ):
        if resume_step == "reconfigure":
            return await self.async_step_reconfigure(user_input)
        return await self.async_step_user(user_input)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry):
        return WeatherRiskBridgeOptionsFlow(config_entry)


class WeatherRiskBridgeOptionsFlow(LocationLookupMixin, config_entries.OptionsFlow):
    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self._config_entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any] | None = None):
        merged = merge_entry_config(self._config_entry)
        defaults = {
            CONF_SERVICE_URL: merged[CONF_SERVICE_URL],
            CONF_BEARER_TOKEN: merged.get(CONF_BEARER_TOKEN, ""),
            CONF_LABEL: merged.get(CONF_LABEL, ""),
            CONF_LATITUDE: merged[CONF_LATITUDE],
            CONF_LONGITUDE: merged[CONF_LONGITUDE],
            CONF_WIND_THRESHOLD_MPH: merged[CONF_WIND_THRESHOLD_MPH],
        }
        errors: dict[str, str] = {}
        if user_input is not None:
            helper_error = await self._consume_location_helpers(user_input, "init")
            if helper_error == "__show_results__":
                return await self.async_step_location_results()
            if helper_error is None:
                try:
                    await _validate_input(self.hass, user_input)
                except ClientError as err:
                    LOGGER.warning(
                        "Weather Risk Suite options flow could not connect to %s: %s",
                        user_input[CONF_SERVICE_URL],
                        err,
                    )
                    errors["base"] = "cannot_connect"
                except Exception:
                    LOGGER.exception("Unexpected Weather Risk Suite options flow failure")
                    errors["base"] = "unknown"
                else:
                    # Preserve the stable location alias across options saves
                    # (same reasoning as the reconfigure step above).
                    preserved_alias = merge_entry_config(
                        self._config_entry
                    ).get(CONF_LOCATION_KEY)
                    options = dict(user_input)
                    if preserved_alias and CONF_LOCATION_KEY not in options:
                        options[CONF_LOCATION_KEY] = preserved_alias
                    return self.async_create_entry(title="", data=options)
            else:
                errors["base"] = helper_error
        return self.async_show_form(
            step_id="init",
            data_schema=_build_schema(defaults),
            errors=errors,
        )

    async def _async_finish_with_location_input(
        self, user_input: dict[str, Any], resume_step: str
    ):
        return await self.async_step_init(user_input)
