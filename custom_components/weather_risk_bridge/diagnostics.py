from __future__ import annotations

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .helpers import REDACT_KEYS


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> dict:
    runtime_data = entry.runtime_data
    snapshot = runtime_data.coordinator.data if runtime_data and runtime_data.coordinator.data else {}
    return {
        "entry": async_redact_data(
            {
                "data": dict(entry.data),
                "options": dict(entry.options),
                "title": entry.title,
            },
            REDACT_KEYS,
        ),
        "source_status": snapshot.get("source_status"),
        "alerts": snapshot.get("alerts", []),
    }
