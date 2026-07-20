from __future__ import annotations

import re

from homeassistant.config_entries import ConfigEntry

from .const import (
    CONF_BEARER_TOKEN,
    CONF_LABEL,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_SERVICE_URL,
    CONF_WIND_THRESHOLD_MPH,
    DEFAULT_SERVICE_URL,
    DEFAULT_WIND_THRESHOLD_MPH,
)


def merge_entry_config(entry: ConfigEntry) -> dict:
    merged = dict(entry.data)
    merged.update(entry.options)
    if not merged.get(CONF_SERVICE_URL):
        merged[CONF_SERVICE_URL] = DEFAULT_SERVICE_URL
    if not merged.get(CONF_WIND_THRESHOLD_MPH):
        merged[CONF_WIND_THRESHOLD_MPH] = DEFAULT_WIND_THRESHOLD_MPH
    return merged


def slugify_label(label: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_")
    return cleaned or "location"


def entry_title_from_config(config: dict) -> str:
    label = (config.get(CONF_LABEL) or "").strip()
    if label:
        return label
    return f"{config[CONF_LATITUDE]:.4f},{config[CONF_LONGITUDE]:.4f}"


def entry_slug_from_config(config: dict) -> str:
    label = (config.get(CONF_LABEL) or "").strip()
    if label:
        return slugify_label(label)
    return slugify_label(f"{config[CONF_LATITUDE]:.4f}_{config[CONF_LONGITUDE]:.4f}")


REDACT_KEYS = {
    CONF_BEARER_TOKEN,
}
