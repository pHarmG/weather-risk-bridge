"""Discover a same-host Weather Risk Bridge app URL via Supervisor."""

from __future__ import annotations

import logging
import os
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import DEFAULT_SERVICE_URL, DOMAIN

LOGGER = logging.getLogger(__name__)

_APP_NAME = "Weather Risk Bridge"
_APP_SLUG_HINT = "weather_risk_bridge"
_APP_PORT = 8099


async def async_resolve_default_service_url(hass: HomeAssistant) -> str:
    """Prefer a reachable same-host app URL; fall back to the documented default."""
    discovered = await async_discover_local_app_service_url(hass)
    if discovered:
        LOGGER.info("Discovered Weather Risk Bridge service at %s", discovered)
        return discovered
    return DEFAULT_SERVICE_URL


async def async_discover_local_app_service_url(hass: HomeAssistant) -> str | None:
    """Return http://<app-ip>:8099 when the Supervisor app is installed and started."""
    token = os.environ.get("SUPERVISOR_TOKEN")
    if not token:
        return None

    session = async_get_clientsession(hass)
    headers = {"Authorization": f"Bearer {token}"}

    try:
        async with session.get(
            "http://supervisor/addons",
            headers=headers,
            timeout=5,
        ) as response:
            if response.status >= 400:
                LOGGER.debug(
                    "Supervisor addons list failed status=%s", response.status
                )
                return None
            payload = await response.json()
    except Exception:  # noqa: BLE001 - discovery must never break config flow
        LOGGER.debug("Supervisor addons list unavailable", exc_info=True)
        return None

    addons = _extract_addons(payload)
    match = _find_weather_app(addons)
    if match is None:
        return None

    slug = match.get("slug")
    if not slug:
        return None

    info = await _async_addon_info(session, headers, str(slug))
    if not info:
        return None

    state = str(info.get("state") or match.get("state") or "").lower()
    if state and state not in {"started", "running"}:
        LOGGER.debug("Weather Risk Bridge app found but state=%s", state)
        return None

    ip_address = info.get("ip_address") or match.get("ip_address")
    if isinstance(ip_address, str) and ip_address.strip():
        return f"http://{ip_address.strip()}:{_APP_PORT}"

    hostname = info.get("hostname") or match.get("hostname")
    if isinstance(hostname, str) and hostname.strip():
        return f"http://{hostname.strip()}:{_APP_PORT}"

    return None


def _extract_addons(payload: Any) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", payload)
    if isinstance(data, dict):
        addons = data.get("addons")
        if isinstance(addons, list):
            return [item for item in addons if isinstance(item, dict)]
        # Newer shapes may be a slug-keyed mapping.
        if all(isinstance(v, dict) for v in data.values()):
            return [dict(v, slug=k) for k, v in data.items()]
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]
    return []


def _find_weather_app(addons: list[dict[str, Any]]) -> dict[str, Any] | None:
    for addon in addons:
        slug = str(addon.get("slug") or "")
        name = str(addon.get("name") or "")
        if _APP_SLUG_HINT in slug or name == _APP_NAME or DOMAIN in slug:
            return addon
    return None


async def _async_addon_info(
    session,
    headers: dict[str, str],
    slug: str,
) -> dict[str, Any] | None:
    try:
        async with session.get(
            f"http://supervisor/addons/{slug}/info",
            headers=headers,
            timeout=5,
        ) as response:
            if response.status >= 400:
                return None
            payload = await response.json()
    except Exception:  # noqa: BLE001
        LOGGER.debug("Supervisor addon info failed for %s", slug, exc_info=True)
        return None

    if not isinstance(payload, dict):
        return None
    data = payload.get("data", payload)
    return data if isinstance(data, dict) else None
