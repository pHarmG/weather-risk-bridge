from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def _normalize_multiline_secret(value: str | None) -> str | None:
    if not value:
        return None
    normalized = value.strip()
    if not normalized:
        return None
    # Supports env files that store multiline PEM blocks with escaped newlines.
    return normalized.replace("\\n", "\n")


def _load_private_key_from_path(path: str | None) -> str | None:
    if not path:
        return None
    candidate = Path(path).expanduser()
    if not candidate.is_file():
        return None
    return candidate.read_text(encoding="utf-8").strip() or None


def _env_flag(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class WeatherKitSettings:
    team_id: str | None
    service_id: str | None
    key_id: str | None
    private_key: str | None
    language: str
    country_code: str | None
    fallback_open_meteo: bool

    @property
    def enabled(self) -> bool:
        return bool(self.team_id and self.service_id and self.key_id and self.private_key)


@dataclass(frozen=True)
class Settings:
    host: str
    port: int
    token: str | None
    user_agent: str
    request_timeout_seconds: float
    route_cache_ttl_seconds: int
    http_cache_ttl_seconds: int
    spc_cache_ttl_seconds: int
    weatherkit: WeatherKitSettings


def load_settings() -> Settings:
    token = os.getenv("WEATHER_RISK_BRIDGE_TOKEN", "").strip() or None
    private_key = _normalize_multiline_secret(
        os.getenv("WEATHER_RISK_BRIDGE_WEATHERKIT_PRIVATE_KEY")
    )
    if private_key is None:
        private_key = _load_private_key_from_path(
            os.getenv("WEATHER_RISK_BRIDGE_WEATHERKIT_PRIVATE_KEY_PATH", "").strip() or None
        )
    weatherkit_country_code = (
        os.getenv("WEATHER_RISK_BRIDGE_WEATHERKIT_COUNTRY_CODE", "").strip().upper() or None
    )
    return Settings(
        host=os.getenv("WEATHER_RISK_BRIDGE_HOST", "0.0.0.0").strip(),
        port=int(os.getenv("WEATHER_RISK_BRIDGE_PORT", "8099")),
        token=token,
        user_agent=os.getenv(
            "WEATHER_RISK_BRIDGE_USER_AGENT",
            "(https://github.com/pHarmG/weather-risk-bridge, weather-risk-bridge@users.noreply.github.com)",
        ).strip(),
        request_timeout_seconds=float(
            os.getenv("WEATHER_RISK_BRIDGE_REQUEST_TIMEOUT_SECONDS", "20")
        ),
        route_cache_ttl_seconds=int(
            os.getenv("WEATHER_RISK_BRIDGE_ROUTE_CACHE_TTL_SECONDS", "180")
        ),
        http_cache_ttl_seconds=int(
            os.getenv("WEATHER_RISK_BRIDGE_HTTP_CACHE_TTL_SECONDS", "180")
        ),
        spc_cache_ttl_seconds=int(
            os.getenv("WEATHER_RISK_BRIDGE_SPC_CACHE_TTL_SECONDS", "1800")
        ),
        weatherkit=WeatherKitSettings(
            team_id=os.getenv("WEATHER_RISK_BRIDGE_WEATHERKIT_TEAM_ID", "").strip() or None,
            service_id=os.getenv("WEATHER_RISK_BRIDGE_WEATHERKIT_SERVICE_ID", "").strip() or None,
            key_id=os.getenv("WEATHER_RISK_BRIDGE_WEATHERKIT_KEY_ID", "").strip() or None,
            private_key=private_key,
            language=os.getenv("WEATHER_RISK_BRIDGE_WEATHERKIT_LANGUAGE", "en").strip() or "en",
            country_code=weatherkit_country_code,
            fallback_open_meteo=_env_flag(
                "WEATHER_RISK_BRIDGE_WEATHERKIT_FALLBACK_OPEN_METEO",
                default=False,
            ),
        ),
    )
