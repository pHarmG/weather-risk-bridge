from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_LATITUDE, CONF_LONGITUDE, DOMAIN, HORIZONS, RISK_KEYS
from .helpers import merge_entry_config


@dataclass(frozen=True)
class SensorSpec:
    unique_key: str
    object_id_suffix: str
    name: str
    kind: str
    horizon: int | None = None
    risk_key: str | None = None
    icon: str | None = None


def _sensor_specs(title: str) -> list[SensorSpec]:
    specs: list[SensorSpec] = []
    for horizon in HORIZONS:
        specs.append(
            SensorSpec(
                unique_key=f"chart_{horizon}",
                object_id_suffix=f"chart_{horizon}h",
                name=f"{title} Chart {horizon}h",
                kind="chart",
                horizon=horizon,
                icon="mdi:chart-bar",
            )
        )
        specs.append(
            SensorSpec(
                unique_key=f"summary_{horizon}",
                object_id_suffix=f"summary_{horizon}h",
                name=f"{title} Summary {horizon}h",
                kind="summary",
                horizon=horizon,
                icon="mdi:text-box-outline",
            )
        )
        for risk_key in RISK_KEYS:
            specs.append(
                SensorSpec(
                    unique_key=f"{risk_key}_{horizon}_max",
                    object_id_suffix=f"{risk_key}_{horizon}h_max",
                    name=f"{title} {risk_key.replace('_', ' ').title()} Max {horizon}h",
                    kind="risk_max",
                    horizon=horizon,
                    risk_key=risk_key,
                    icon="mdi:chart-timeline-variant",
                )
            )
    specs.extend(
        [
            SensorSpec(
                unique_key="alert_count",
                object_id_suffix="alerts_active_count",
                name=f"{title} Alerts Active Count",
                kind="alert_count",
                icon="mdi:alert-circle-outline",
            ),
            SensorSpec(
                unique_key="alert_headline",
                object_id_suffix="alerts_top_headline",
                name=f"{title} Alerts Top Headline",
                kind="alert_headline",
                icon="mdi:bullhorn-outline",
            ),
            SensorSpec(
                unique_key="alert_severity",
                object_id_suffix="alerts_top_severity",
                name=f"{title} Alerts Top Severity",
                kind="alert_severity",
                icon="mdi:shield-alert-outline",
            ),
        ]
    )
    return specs


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    runtime_data = entry.runtime_data
    async_add_entities(
        WeatherRiskBridgeSensor(entry, spec)
        for spec in _sensor_specs(runtime_data.title)
    )


class WeatherRiskBridgeSensor(CoordinatorEntity, SensorEntity):
    _attr_has_entity_name = False

    def __init__(self, entry: ConfigEntry, spec: SensorSpec) -> None:
        super().__init__(entry.runtime_data.coordinator)
        self._entry = entry
        self._spec = spec
        self._attr_unique_id = f"{entry.entry_id}-{spec.unique_key}"
        self._attr_name = spec.name
        self._attr_icon = spec.icon

    @property
    def suggested_object_id(self) -> str | None:
        return f"weather_risk_bridge_{self._entry.runtime_data.slug}_{self._spec.object_id_suffix}"

    @property
    def device_info(self) -> dict[str, Any]:
        return {
            "identifiers": {(DOMAIN, self._entry.entry_id)},
            "name": self._entry.runtime_data.title,
            "manufacturer": "Weather Risk Bridge",
            "model": "NOAA Service",
        }

    @property
    def native_unit_of_measurement(self) -> str | None:
        if self._spec.kind == "risk_max":
            return PERCENTAGE
        return None

    @property
    def native_value(self) -> Any:
        data = self.coordinator.data or {}
        alerts = data.get("alerts", [])
        if self._spec.kind == "alert_count":
            return len(alerts)
        if self._spec.kind == "alert_headline":
            return alerts[0]["headline"] if alerts else "No active alerts"
        if self._spec.kind == "alert_severity":
            return alerts[0]["severity"] if alerts else "none"

        horizon_data = data.get("horizons", {}).get(str(self._spec.horizon), {})
        if self._spec.kind == "summary":
            return horizon_data.get("summary", "Unavailable")
        if self._spec.kind == "chart":
            return data.get("source_status", {}).get("generated_at", "unknown")
        if self._spec.kind == "risk_max":
            return horizon_data.get("maxima", {}).get(self._spec.risk_key)
        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        data = self.coordinator.data or {}
        if self._spec.kind == "chart":
            horizon_data = dict(data.get("horizons", {}).get(str(self._spec.horizon), {}))
            horizon_data["alerts"] = data.get("alerts", [])
            horizon_data["generated_at"] = data.get("source_status", {}).get("generated_at")
            # Observer position for Lovelace (e.g. sun/moon tracks): always use the
            # coordinates from this config entry, not the NWS grid point in the payload.
            source_status = dict(data.get("source_status") or {})
            entry_cfg = merge_entry_config(self._entry)
            source_status["latitude"] = entry_cfg[CONF_LATITUDE]
            source_status["longitude"] = entry_cfg[CONF_LONGITUDE]
            horizon_data["source_status"] = source_status
            return horizon_data
        if self._spec.kind.startswith("alert"):
            return {"alerts": data.get("alerts", [])}
        return None
