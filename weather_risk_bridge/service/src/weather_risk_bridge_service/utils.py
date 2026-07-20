from __future__ import annotations

import math
import re
from datetime import UTC, datetime, timedelta
from typing import Iterable

import isodate


def parse_interval(interval: str) -> tuple[datetime, datetime]:
    start_raw, duration_raw = interval.split("/", 1)
    start = datetime.fromisoformat(start_raw)
    duration = isodate.parse_duration(duration_raw)
    if isinstance(duration, isodate.duration.Duration):
        duration = duration.timedelta
    return start, start + duration


def ensure_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def hourly_timeline(now: datetime, hours: int) -> list[datetime]:
    current = now.astimezone(now.tzinfo).replace(minute=0, second=0, microsecond=0)
    return [current + timedelta(hours=index) for index in range(hours)]


def max_or_zero(values: Iterable[float]) -> float:
    values_list = list(values)
    return max(values_list) if values_list else 0.0


def average_or_zero(values: Iterable[float]) -> float:
    values_list = list(values)
    if not values_list:
        return 0.0
    return sum(values_list) / len(values_list)


def parse_wind_speed_mph(text: str | None) -> float | None:
    if not text:
        return None
    match = re.search(r"(\d+)", text)
    if not match:
        return None
    return float(match.group(1))


def celsius_to_fahrenheit(value_c: float | None) -> float | None:
    if value_c is None:
        return None
    return (value_c * 9 / 5) + 32


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def millimeters_to_inches(value_mm: float | None) -> float | None:
    if value_mm is None:
        return None
    return value_mm / 25.4


def _wind_chill_f(temperature_f: float, wind_speed_mph: float) -> float:
    wind_factor = wind_speed_mph**0.16
    return (
        35.74
        + (0.6215 * temperature_f)
        - (35.75 * wind_factor)
        + (0.4275 * temperature_f * wind_factor)
    )


def _heat_index_f(temperature_f: float, humidity_percent: float) -> float:
    heat_index = (
        -42.379
        + (2.04901523 * temperature_f)
        + (10.14333127 * humidity_percent)
        - (0.22475541 * temperature_f * humidity_percent)
        - (0.00683783 * temperature_f * temperature_f)
        - (0.05481717 * humidity_percent * humidity_percent)
        + (0.00122874 * temperature_f * temperature_f * humidity_percent)
        + (0.00085282 * temperature_f * humidity_percent * humidity_percent)
        - (0.00000199 * temperature_f * temperature_f * humidity_percent * humidity_percent)
    )
    if humidity_percent < 13 and 80 <= temperature_f <= 112:
        adjustment = ((13 - humidity_percent) / 4) * math.sqrt((17 - abs(temperature_f - 95)) / 17)
        heat_index -= adjustment
    elif humidity_percent > 85 and 80 <= temperature_f <= 87:
        adjustment = ((humidity_percent - 85) / 10) * ((87 - temperature_f) / 5)
        heat_index += adjustment
    return heat_index


def _solar_factor_from_condition(weather_condition_text: str | None) -> float:
    if not weather_condition_text:
        return 0.5
    condition = weather_condition_text.lower()
    if "sunny" in condition or "clear" in condition:
        return 1.0
    if "mostly sunny" in condition:
        return 0.9
    if "partly" in condition:
        return 0.65
    if "mostly cloudy" in condition:
        return 0.35
    if "cloud" in condition or "overcast" in condition or "fog" in condition:
        return 0.2
    if "thunder" in condition or "rain" in condition or "showers" in condition or "drizzle" in condition:
        return 0.12
    return 0.5


def _precipitation_signal(
    precipitation_inches: float | None,
    weather_condition_text: str | None,
) -> float:
    signal = 0.0
    if precipitation_inches is not None and precipitation_inches > 0:
        signal = clamp(precipitation_inches / 0.1, 0.25, 1.0)
    condition = (weather_condition_text or "").lower()
    if "thunder" in condition:
        signal = max(signal, 0.75)
    elif "rain" in condition or "showers" in condition or "drizzle" in condition:
        signal = max(signal, 0.5)
    return signal


def apparent_temperature_components_f(
    temperature_f: float | None,
    humidity_percent: float | None,
    wind_speed_mph: float | None,
    cloud_cover_percent: float | None = None,
    daytime: bool | None = None,
    uv_index: float | None = None,
    weather_condition_text: str | None = None,
    precipitation_inches: float | None = None,
) -> dict[str, float | None]:
    if temperature_f is None:
        return {
            "feels_like_basic": None,
            "feels_like_enhanced": None,
            "feels_like_shade": None,
        }

    humidity = clamp(float(humidity_percent), 0.0, 100.0) if humidity_percent is not None else None
    wind_speed = max(float(wind_speed_mph or 0.0), 0.0)

    if temperature_f <= 50 and wind_speed > 3:
        basic = _wind_chill_f(temperature_f, wind_speed)
    elif humidity is not None and temperature_f >= 80 and humidity >= 40:
        basic = _heat_index_f(temperature_f, humidity)
    else:
        basic = temperature_f

    solar_adjustment = 0.0
    if daytime:
        solar_factor = (
            clamp(float(uv_index) / 11.0, 0.0, 1.0)
            if uv_index is not None
            else _solar_factor_from_condition(weather_condition_text)
        )
        cloud_factor = 1.0 - clamp(float(cloud_cover_percent or 0.0), 0.0, 100.0) / 100.0
        if temperature_f >= 85:
            solar_ceiling = 7.0
        elif temperature_f >= 70:
            solar_ceiling = 5.0
        elif temperature_f >= 50:
            solar_ceiling = 3.5
        else:
            solar_ceiling = 2.0
        solar_adjustment = solar_ceiling * solar_factor * cloud_factor

    wind_adjustment = 0.0
    if temperature_f >= 70 and wind_speed > 5:
        wind_adjustment = -min((wind_speed - 5) * 0.18, 4.0)

    humidity_adjustment = 0.0
    if temperature_f >= 75 and humidity is not None and humidity >= 55:
        humidity_adjustment = min(
            ((humidity - 55) / 10.0) * 0.45 + max(temperature_f - 75, 0.0) * 0.06,
            4.0,
        )

    rain_adjustment = 0.0
    rain_signal = _precipitation_signal(precipitation_inches, weather_condition_text)
    if rain_signal > 0:
        if temperature_f >= 75:
            rain_adjustment = 1.5 * rain_signal
        elif temperature_f <= 60:
            rain_adjustment = -2.0 * rain_signal
        else:
            rain_adjustment = -0.5 * rain_signal

    shade = basic + wind_adjustment + humidity_adjustment + rain_adjustment
    enhanced = shade + solar_adjustment
    return {
        "feels_like_basic": basic,
        "feels_like_enhanced": enhanced,
        "feels_like_shade": shade,
    }


def apparent_temperature_f(
    temperature_f: float | None,
    humidity_percent: float | None,
    wind_speed_mph: float | None,
) -> float | None:
    return apparent_temperature_components_f(
        temperature_f=temperature_f,
        humidity_percent=humidity_percent,
        wind_speed_mph=wind_speed_mph,
    )["feels_like_enhanced"]


def kmh_to_mph(value_kmh: float | None) -> float | None:
    if value_kmh is None:
        return None
    return value_kmh * 0.621371


def round_value(value: float | None, digits: int = 1) -> float | None:
    if value is None:
        return None
    return round(value, digits)


def is_zeroish(value: float | None) -> bool:
    if value is None:
        return True
    return math.isclose(value, 0.0, abs_tol=0.01)
