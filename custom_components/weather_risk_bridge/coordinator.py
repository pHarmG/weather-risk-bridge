from __future__ import annotations

import logging
from contextlib import suppress

from aiohttp import ClientResponseError
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import WeatherRiskBridgeClient
from .const import (
    CONF_LABEL,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_WIND_THRESHOLD_MPH,
    DEFAULT_SCAN_INTERVAL,
)

LOGGER = logging.getLogger(__name__)


class WeatherRiskBridgeCoordinator(DataUpdateCoordinator[dict]):
    def __init__(
        self,
        hass: HomeAssistant,
        client: WeatherRiskBridgeClient,
        config: dict,
    ) -> None:
        super().__init__(
            hass,
            logger=LOGGER,
            name="weather_risk_bridge",
            update_interval=DEFAULT_SCAN_INTERVAL,
        )
        self._client = client
        self._config = config

    async def _async_update_data(self) -> dict:
        try:
            LOGGER.debug(
                "Refreshing Weather Risk Bridge data lat=%s lon=%s label=%s wind_threshold_mph=%s",
                self._config[CONF_LATITUDE],
                self._config[CONF_LONGITUDE],
                self._config.get(CONF_LABEL),
                self._config[CONF_WIND_THRESHOLD_MPH],
            )
            return await self._client.async_snapshot(
                latitude=self._config[CONF_LATITUDE],
                longitude=self._config[CONF_LONGITUDE],
                label=self._config.get(CONF_LABEL),
                wind_threshold_mph=self._config[CONF_WIND_THRESHOLD_MPH],
            )
        except ClientResponseError as err:
            if err.status == 401:
                LOGGER.error("Weather Risk Bridge rejected the configured bearer token")
                raise ConfigEntryAuthFailed("Service rejected bearer token") from err
            message = None
            with suppress(Exception):
                message = str(err.message)
            LOGGER.warning(
                "Weather Risk Bridge refresh failed with HTTP %s%s",
                err.status,
                f": {message}" if message else "",
            )
            raise UpdateFailed(f"Service request failed: {err.status}") from err
        except Exception as err:
            LOGGER.exception("Unexpected Weather Risk Bridge refresh failure")
            raise UpdateFailed(str(err)) from err
