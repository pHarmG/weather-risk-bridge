from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.weather import Forecast, WeatherEntity, WeatherEntityFeature
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfSpeed, UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([WeatherRiskBridgeWeather(entry)])


class WeatherRiskBridgeWeather(CoordinatorEntity, WeatherEntity):
    _attr_has_entity_name = False
    _attr_supported_features = (
        WeatherEntityFeature.FORECAST_HOURLY | WeatherEntityFeature.FORECAST_DAILY
    )
    _attr_native_temperature_unit = UnitOfTemperature.FAHRENHEIT
    _attr_native_wind_speed_unit = UnitOfSpeed.MILES_PER_HOUR

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__(entry.runtime_data.coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}-weather"
        self._attr_name = f"{entry.runtime_data.title} Weather"

    @property
    def suggested_object_id(self) -> str | None:
        return f"weather_risk_bridge_{self._entry.runtime_data.slug}"

    @property
    def device_info(self) -> dict[str, Any]:
        return {
            "identifiers": {(DOMAIN, self._entry.entry_id)},
            "name": self._entry.runtime_data.title,
            "manufacturer": "Weather Risk Bridge",
            "model": "NOAA Service",
        }

    @property
    def condition(self) -> str | None:
        return (self.coordinator.data or {}).get("current", {}).get("condition")

    @property
    def native_temperature(self) -> float | None:
        return (self.coordinator.data or {}).get("current", {}).get("temperature_f")

    @property
    def native_dew_point(self) -> float | None:
        return (self.coordinator.data or {}).get("current", {}).get("dew_point_f")

    @property
    def humidity(self) -> float | None:
        return (self.coordinator.data or {}).get("current", {}).get("humidity_percent")

    @property
    def native_wind_speed(self) -> float | None:
        return (self.coordinator.data or {}).get("current", {}).get("wind_speed_mph")

    def _uv_index_peak_today(self) -> float | None:
        data = self.coordinator.data or {}
        hourly = data.get("hourly", [])
        if not isinstance(hourly, list) or not hourly:
            return None

        peak: float | None = None
        current_date = None
        for hour in hourly:
            if not isinstance(hour, dict):
                continue
            start_raw = hour.get("start")
            uv_raw = hour.get("uv_index")
            if not isinstance(start_raw, str) or uv_raw is None:
                continue
            try:
                start = datetime.fromisoformat(start_raw)
                uv_value = float(uv_raw)
            except (TypeError, ValueError):
                continue
            if current_date is None:
                tzinfo = start.tzinfo
                current_date = datetime.now(tzinfo).date() if tzinfo else datetime.now().date()
            if start.date() != current_date:
                continue
            peak = uv_value if peak is None else max(peak, uv_value)
        return peak

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        current = (self.coordinator.data or {}).get("current", {})
        return {
            "uv_index": current.get("uv_index"),
            "uv_index_peak_today": self._uv_index_peak_today(),
            "daytime": current.get("daytime"),
            "short_forecast": current.get("short_forecast"),
        }

    async def async_forecast_hourly(self) -> list[Forecast] | None:
        return (self.coordinator.data or {}).get("hourly_forecast")

    async def async_forecast_daily(self) -> list[Forecast] | None:
        return (self.coordinator.data or {}).get("daily_forecast")
