"""Serve and auto-register the embedded Lovelace card."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_call_later

from .const import CARD_FILENAME, DOMAIN, FRONTEND_URL_BASE, VERSION

_LOGGER = logging.getLogger(__name__)


def card_resource_url() -> str:
    return f"{FRONTEND_URL_BASE}/{CARD_FILENAME}?v={VERSION}"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register static card assets and Lovelace module resource once."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get("frontend_registered"):
        return

    www_dir = Path(__file__).parent / "www"
    if not www_dir.is_dir():
        _LOGGER.warning(
            "Weather Risk Bridge www/ is missing; Lovelace card will not be served"
        )
        return

    try:
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    url_path=FRONTEND_URL_BASE,
                    path=str(www_dir),
                    cache_headers=True,
                )
            ]
        )
    except RuntimeError:
        # Path already registered (reload / duplicate setup).
        _LOGGER.debug("Static path %s already registered", FRONTEND_URL_BASE)

    domain_data["frontend_registered"] = True
    await _async_register_lovelace_resource(hass)

    # Lovelace may not be ready during early setup; retry once shortly after.
    async def _retry(_now=None) -> None:
        await _async_register_lovelace_resource(hass)

    async_call_later(hass, 5.0, _retry)


async def _async_register_lovelace_resource(hass: HomeAssistant) -> None:
    card_url = card_resource_url()
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        _LOGGER.debug("Lovelace not ready; deferred card resource registration")
        return

    mode = getattr(lovelace, "mode", None)
    if mode != "storage":
        _LOGGER.info(
            "Lovelace is not in storage mode; add module resource manually: %s",
            card_url,
        )
        return

    resources = getattr(lovelace, "resources", None)
    if resources is None:
        return

    try:
        await resources.async_get_info()
    except Exception:  # noqa: BLE001 - best-effort load across HA versions
        try:
            await resources.async_load()
        except Exception:  # noqa: BLE001
            _LOGGER.debug("Unable to load Lovelace resources yet", exc_info=True)
            return

    prefix = f"{FRONTEND_URL_BASE}/{CARD_FILENAME}"
    try:
        for item in resources.async_items():
            url = str(item.get("url", ""))
            if url == card_url or url.startswith(prefix):
                if url != card_url and hasattr(resources, "async_update_item"):
                    await resources.async_update_item(
                        item["id"],
                        {"res_type": "module", "url": card_url},
                    )
                    _LOGGER.info("Updated Lovelace resource to %s", card_url)
                return

        await resources.async_create_item({"res_type": "module", "url": card_url})
        _LOGGER.info("Registered Lovelace resource %s", card_url)
    except Exception:  # noqa: BLE001
        _LOGGER.exception("Failed to register Weather Risk Bridge Lovelace resource")
