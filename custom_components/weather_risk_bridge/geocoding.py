"""Resolve friendly place searches to coordinates (Open-Meteo geocoding).

Raw "latitude / longitude" entry is unfriendly, so the integration offers a
place-name lookup in the config flow and via the ``resolve_location`` service.
The Open-Meteo geocoding API is free, needs no API key, and returns
well-formed candidates with admin region and country for readable labels.
"""

from __future__ import annotations

import logging
from typing import Any

from aiohttp import ClientError, ClientSession
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

LOGGER = logging.getLogger(__name__)

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
MAX_RESULTS = 8
REQUEST_TIMEOUT_SECONDS = 8


class GeocodingError(RuntimeError):
    """Raised when a place search cannot be completed."""


def _candidate_label(item: dict[str, Any]) -> str:
    parts = [item.get("name"), item.get("admin1"), item.get("country")]
    return ", ".join(str(part) for part in parts if part)


def _build_candidate(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "name": str(item.get("name") or ""),
        "label": _candidate_label(item),
        "latitude": round(float(item["latitude"]), 4),
        "longitude": round(float(item["longitude"]), 4),
        "country_code": str(item.get("country_code") or ""),
    }


async def async_search_locations(
    hass: HomeAssistant, session: ClientSession | None, query: str
) -> list[dict[str, Any]]:
    """Return up to MAX_RESULTS coordinate candidates for a place search.

    US candidates sort first because the weather service covers US locations.
    Raises GeocodingError on transport or service failures.
    """
    cleaned = (query or "").strip()
    if not cleaned:
        return []
    client_session = session or async_get_clientsession(hass)
    try:
        async with client_session.get(
            GEOCODING_URL,
            params={
                "name": cleaned,
                "count": MAX_RESULTS,
                "language": "en",
                "format": "json",
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        ) as response:
            if response.status >= 400:
                raise GeocodingError(
                    f"Geocoding service returned HTTP {response.status}"
                )
            payload = await response.json()
    except TimeoutError as err:
        raise GeocodingError("Location search timed out") from err
    except ClientError as err:
        raise GeocodingError(f"Location search failed: {err}") from err

    results = payload.get("results") if isinstance(payload, dict) else None
    if not isinstance(results, list):
        return []
    candidates = [
        _build_candidate(item)
        for item in results
        if isinstance(item, dict)
        and isinstance(item.get("latitude"), (int, float))
        and isinstance(item.get("longitude"), (int, float))
    ]
    candidates.sort(key=lambda candidate: candidate["country_code"] != "US")
    if not candidates:
        LOGGER.debug("No geocoding results for query %r", cleaned)
    return candidates
