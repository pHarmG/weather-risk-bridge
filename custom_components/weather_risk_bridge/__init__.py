from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import WeatherRiskBridgeClient
from .const import (
    CONF_BEARER_TOKEN,
    CONF_SERVICE_URL,
    DOMAIN,
    PLATFORMS,
    RuntimeData,
)
from .coordinator import WeatherRiskBridgeCoordinator
from .frontend import async_register_frontend
from .helpers import entry_slug_from_config, entry_title_from_config, merge_entry_config

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    hass.data.setdefault(DOMAIN, {})
    await async_register_frontend(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.data.setdefault(DOMAIN, {})
    await async_register_frontend(hass)

    config = merge_entry_config(entry)
    session = async_get_clientsession(hass)
    client = WeatherRiskBridgeClient(
        session=session,
        service_url=config[CONF_SERVICE_URL],
        bearer_token=config.get(CONF_BEARER_TOKEN),
    )
    coordinator = WeatherRiskBridgeCoordinator(hass, client, config)
    await coordinator.async_config_entry_first_refresh()
    _LOGGER.info(
        "Configured Weather Risk Bridge entry '%s' using service %s",
        entry_title_from_config(config),
        config[CONF_SERVICE_URL],
    )

    entry.runtime_data = RuntimeData(
        client=client,
        coordinator=coordinator,
        slug=entry_slug_from_config(config),
        title=entry_title_from_config(config),
    )

    await hass.config_entries.async_forward_entry_setups(
        entry,
        [Platform.SENSOR, Platform.WEATHER],
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        _LOGGER.info("Unloaded Weather Risk Bridge entry '%s'", entry.title)
    return unloaded


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    _LOGGER.info("Reloading Weather Risk Bridge entry '%s'", entry.title)
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)
