from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta

DOMAIN = "weather_risk_bridge"
VERSION = "0.1.2"
PLATFORMS = ["sensor", "weather"]

CONF_SERVICE_URL = "service_url"
CONF_BEARER_TOKEN = "bearer_token"
CONF_LABEL = "label"
CONF_LATITUDE = "latitude"
CONF_LONGITUDE = "longitude"
CONF_WIND_THRESHOLD_MPH = "wind_threshold_mph"

# Fallback only when Supervisor discovery cannot find a local app.
# On HAOS the config flow prefers http://<app-container-ip>:8099 from discovery.
DEFAULT_SERVICE_URL = "http://weather-risk-bridge:8099"
DEFAULT_WIND_THRESHOLD_MPH = 40
DEFAULT_SCAN_INTERVAL = timedelta(minutes=5)

FRONTEND_URL_BASE = f"/{DOMAIN}"
CARD_FILENAME = "weather-risk-bridge-card.js"

HORIZONS = (1, 4, 12, 24, 48)
RISK_KEYS = ("rain", "storm", "strong_wind", "hail", "tornado")


@dataclass(frozen=True)
class RuntimeData:
    client: object
    coordinator: object
    slug: str
    title: str
