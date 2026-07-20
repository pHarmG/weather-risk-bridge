from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime, timedelta
import logging
from typing import Any, Callable

import httpx
import jwt

from .cache import HttpDocumentCache
from .settings import WeatherKitSettings
from .spc import SpcClient
from .utils import (
    apparent_temperature_components_f,
    average_or_zero,
    celsius_to_fahrenheit,
    ensure_utc,
    hourly_timeline,
    is_zeroish,
    kmh_to_mph,
    millimeters_to_inches,
    max_or_zero,
    parse_interval,
    parse_wind_speed_mph,
    round_value,
)


NWS_POINT_URL = "https://api.weather.gov/points/{lat},{lon}"
NWS_ALERTS_URL = "https://api.weather.gov/alerts/active?point={lat},{lon}"
OPEN_METEO_FORECAST_URL = (
    "https://api.open-meteo.com/v1/forecast"
    "?latitude={lat}&longitude={lon}"
    "&current=uv_index,is_day,precipitation_probability,rain,showers,snowfall,precipitation,weather_code"
    "&hourly=uv_index,is_day,precipitation_probability,rain,showers,snowfall,precipitation,weather_code"
    "&forecast_hours=48"
    "&precipitation_unit=mm"
    "&timezone=GMT"
)
OPEN_METEO_MINUTE_NOWCAST_URL = (
    "https://api.open-meteo.com/v1/forecast"
    "?latitude={lat}&longitude={lon}"
    "&minutely_15=precipitation,weather_code"
    "&timezone=GMT"
)
WEATHERKIT_WEATHER_URL = "https://weatherkit.apple.com/api/v1/weather/{language}/{lat}/{lon}"

WIND_THRESHOLD_FIELD = {
    30: "potentialOf30mphWindGusts",
    40: "potentialOf40mphWindGusts",
    50: "potentialOf50mphWindGusts",
    60: "potentialOf60mphWindGusts",
}

HAZARD_LABELS = {
    "rain": "Rain",
    "storm": "Thunderstorms",
    "strong_wind": "Strong Winds",
    "hail": "Hail",
    "tornado": "Tornado",
    "temperature": "Temperature",
}

HAZARD_UNITS = {
    "rain": "%",
    "storm": "%",
    "strong_wind": "%",
    "hail": "%",
    "tornado": "%",
    "temperature": "degF",
}

HORIZON_BINS = {
    1: 1,
    4: 1,
    12: 1,
    24: 2,
    48: 3,
}

NOWCAST_BUCKET_MINUTES = 15
NOWCAST_POINT_MINUTES = 5
NOWCAST_POINTS_PER_BUCKET = NOWCAST_BUCKET_MINUTES // NOWCAST_POINT_MINUTES
NOWCAST_HORIZON_BUCKETS = 4
NOWCAST_ACTIVE_PROBABILITY_THRESHOLD = 5.0

THUNDER_WEATHER_CODES = {95, 96, 99}
SNOW_WEATHER_CODES = {71, 73, 75, 77, 85, 86}
MIXED_WEATHER_CODES = {68}
RAIN_WEATHER_CODES = {51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82}

OBS_STORM_KEYWORDS = ("thunder", "tstm", "storm", "lightning", "hail")
OBS_RAIN_KEYWORDS = ("rain", "drizzle", "shower")
OBS_SNOW_KEYWORDS = ("snow", "flurr", "blizzard")
OBS_MIXED_KEYWORDS = ("sleet", "mix", "freezing")
OBS_NOWCAST_MAX_AGE_MINUTES = 90
NWS_OBSERVATION_STATION_PROBE_LIMIT = 8

LOGGER = logging.getLogger(__name__)


def _value_for_bucket(values: list[dict[str, Any]], bucket_start: datetime) -> Any:
    for item in values:
        start, end = parse_interval(item["validTime"])
        if ensure_utc(start) <= bucket_start < ensure_utc(end):
            return item["value"]
    return None


def _expand_grid(values: list[dict[str, Any]], buckets: list[datetime]) -> list[Any]:
    return [_value_for_bucket(values, bucket) for bucket in buckets]


def _expand_optional_grid(
    properties: dict[str, Any],
    field_name: str,
    buckets: list[datetime],
) -> list[Any]:
    field = properties.get(field_name) or {}
    values = field.get("values") or []
    return _expand_grid(values, buckets)


def _normalize_uv_values(values: list[Any]) -> list[float | None]:
    return [round_value(float(value), 1) if value is not None else None for value in values]


def _parse_number(value: Any) -> float | None:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return None
    if parsed != parsed:
        return None
    return parsed


def _normalize_probability_value(value: Any) -> float | None:
    parsed = _parse_number(value)
    if parsed is None:
        return None
    return round_value(min(100.0, max(0.0, parsed)), 1)


def _normalize_open_meteo_inches(value: Any) -> float | None:
    parsed = _parse_number(value)
    if parsed is None:
        return None
    return round_value(max(millimeters_to_inches(parsed) or 0.0, 0.0), 3)


def _normalize_open_meteo_snowfall_cm(value: Any) -> float | None:
    parsed = _parse_number(value)
    if parsed is None:
        return None
    return round_value(max(parsed, 0.0), 3)


def _normalize_open_meteo_weather_code(value: Any) -> int | None:
    parsed = _parse_number(value)
    if parsed is None:
        return None
    try:
        return int(parsed)
    except (TypeError, ValueError):
        return None


def _expand_open_meteo_hourly_field(
    payload: dict[str, Any] | None,
    buckets: list[datetime],
    *,
    field_name: str,
    transform: Callable[[Any], Any],
) -> list[Any]:
    if not payload:
        return [None for _ in buckets]

    hourly = payload.get("hourly") or {}
    raw_times = hourly.get("time") or []
    raw_values = hourly.get(field_name) or []
    values_by_bucket: dict[datetime, Any] = {}

    for raw_time, raw_value in zip(raw_times, raw_values, strict=False):
        bucket_start = _parse_open_meteo_time(raw_time)
        if bucket_start is None:
            continue
        values_by_bucket[bucket_start] = transform(raw_value)

    return [values_by_bucket.get(bucket_start) for bucket_start in buckets]


def _current_open_meteo_field(
    payload: dict[str, Any] | None,
    *,
    field_name: str,
    transform: Callable[[Any], Any],
) -> Any:
    if not payload:
        return None

    current = payload.get("current") or {}
    return transform(current.get(field_name))


def _expand_nws_uv_index(
    properties: dict[str, Any],
    buckets: list[datetime],
) -> list[float | None]:
    uv_grid_values = _expand_optional_grid(properties, "uvIndex", buckets)
    if not any(value is not None for value in uv_grid_values):
        uv_grid_values = _expand_optional_grid(properties, "ultravioletIndex", buckets)
    return _normalize_uv_values(uv_grid_values)


def _expand_open_meteo_uv_index(
    payload: dict[str, Any] | None,
    buckets: list[datetime],
) -> list[float | None]:
    return _expand_open_meteo_hourly_field(
        payload,
        buckets,
        field_name="uv_index",
        transform=lambda raw_value: (
            round_value(parsed, 1) if (parsed := _parse_number(raw_value)) is not None else None
        ),
    )


def _current_open_meteo_uv_index(payload: dict[str, Any] | None) -> float | None:
    return _current_open_meteo_field(
        payload,
        field_name="uv_index",
        transform=lambda raw_value: (
            round_value(parsed, 1) if (parsed := _parse_number(raw_value)) is not None else None
        ),
    )


def _select_uv_index_source(
    *,
    grid_properties: dict[str, Any],
    open_meteo_payload: dict[str, Any] | None,
    buckets: list[datetime],
) -> tuple[list[float | None], float | None, str]:
    open_meteo_hourly = _expand_open_meteo_uv_index(open_meteo_payload, buckets)
    open_meteo_current = _current_open_meteo_uv_index(open_meteo_payload)
    if any(value is not None for value in open_meteo_hourly) or open_meteo_current is not None:
        return (
            open_meteo_hourly,
            open_meteo_current if open_meteo_current is not None else open_meteo_hourly[0],
            "open-meteo",
        )

    nws_uv = _expand_nws_uv_index(grid_properties, buckets)
    return (nws_uv, nws_uv[0] if nws_uv else None, "nws")


def _open_meteo_precip_kind(
    *,
    rain_inches: float | None,
    showers_inches: float | None,
    snowfall_cm: float | None,
    weather_code: int | None,
) -> str:
    liquid_inches = max(_to_float(rain_inches, 0.0), 0.0) + max(_to_float(showers_inches, 0.0), 0.0)
    snowfall_active = _to_float(snowfall_cm, 0.0) > 0.0

    if weather_code in THUNDER_WEATHER_CODES:
        if snowfall_active or weather_code in MIXED_WEATHER_CODES:
            return "mix"
        return "storm"
    if liquid_inches > 0.0:
        if snowfall_active or weather_code in MIXED_WEATHER_CODES:
            return "mix"
        return "rain"
    if snowfall_active:
        return "snow"
    if weather_code in RAIN_WEATHER_CODES:
        return "rain"
    if weather_code in MIXED_WEATHER_CODES:
        return "mix"
    if weather_code in SNOW_WEATHER_CODES:
        return "snow"
    return "none"


def _open_meteo_rain_probability(
    *,
    precipitation_probability: float | None,
    rain_inches: float | None,
    showers_inches: float | None,
    snowfall_cm: float | None,
    weather_code: int | None,
) -> float | None:
    if precipitation_probability is None:
        return None

    precip_kind = _open_meteo_precip_kind(
        rain_inches=rain_inches,
        showers_inches=showers_inches,
        snowfall_cm=snowfall_cm,
        weather_code=weather_code,
    )
    if precip_kind in {"rain", "storm", "mix"}:
        return precipitation_probability
    return 0.0


def _expand_open_meteo_rain_probability(
    payload: dict[str, Any] | None,
    buckets: list[datetime],
) -> list[float | None]:
    precipitation_probability = _expand_open_meteo_hourly_field(
        payload,
        buckets,
        field_name="precipitation_probability",
        transform=_normalize_probability_value,
    )
    rain_values = _expand_open_meteo_hourly_field(
        payload,
        buckets,
        field_name="rain",
        transform=_normalize_open_meteo_inches,
    )
    shower_values = _expand_open_meteo_hourly_field(
        payload,
        buckets,
        field_name="showers",
        transform=_normalize_open_meteo_inches,
    )
    snowfall_values = _expand_open_meteo_hourly_field(
        payload,
        buckets,
        field_name="snowfall",
        transform=_normalize_open_meteo_snowfall_cm,
    )
    weather_codes = _expand_open_meteo_hourly_field(
        payload,
        buckets,
        field_name="weather_code",
        transform=_normalize_open_meteo_weather_code,
    )

    output: list[float | None] = []
    for index in range(len(buckets)):
        output.append(
            _open_meteo_rain_probability(
                precipitation_probability=precipitation_probability[index],
                rain_inches=rain_values[index],
                showers_inches=shower_values[index],
                snowfall_cm=snowfall_values[index],
                weather_code=weather_codes[index],
            )
        )
    return output


def _current_open_meteo_rain_probability(payload: dict[str, Any] | None) -> float | None:
    return _open_meteo_rain_probability(
        precipitation_probability=_current_open_meteo_field(
            payload,
            field_name="precipitation_probability",
            transform=_normalize_probability_value,
        ),
        rain_inches=_current_open_meteo_field(
            payload,
            field_name="rain",
            transform=_normalize_open_meteo_inches,
        ),
        showers_inches=_current_open_meteo_field(
            payload,
            field_name="showers",
            transform=_normalize_open_meteo_inches,
        ),
        snowfall_cm=_current_open_meteo_field(
            payload,
            field_name="snowfall",
            transform=_normalize_open_meteo_snowfall_cm,
        ),
        weather_code=_current_open_meteo_field(
            payload,
            field_name="weather_code",
            transform=_normalize_open_meteo_weather_code,
        ),
    )


def _expand_open_meteo_rain_amounts(
    payload: dict[str, Any] | None,
    buckets: list[datetime],
) -> list[dict[str, float | None]]:
    rain_values = _expand_open_meteo_hourly_field(
        payload,
        buckets,
        field_name="rain",
        transform=_normalize_open_meteo_inches,
    )
    shower_values = _expand_open_meteo_hourly_field(
        payload,
        buckets,
        field_name="showers",
        transform=_normalize_open_meteo_inches,
    )
    precipitation_values = _expand_open_meteo_hourly_field(
        payload,
        buckets,
        field_name="precipitation",
        transform=_normalize_open_meteo_inches,
    )
    snowfall_values = _expand_open_meteo_hourly_field(
        payload,
        buckets,
        field_name="snowfall",
        transform=_normalize_open_meteo_snowfall_cm,
    )

    output: list[dict[str, float | None]] = []
    for index in range(len(buckets)):
        rain_inches = rain_values[index]
        showers_inches = shower_values[index]
        liquid_parts = [value for value in (rain_inches, showers_inches) if value is not None]
        liquid_inches = round_value(sum(liquid_parts), 3) if liquid_parts else None
        output.append(
            {
                "rain_inches": rain_inches,
                "showers_inches": showers_inches,
                "liquid_inches": liquid_inches,
                "precipitation_inches": precipitation_values[index],
                "snowfall_cm": snowfall_values[index],
            }
        )
    return output


def _current_open_meteo_rain_amounts(payload: dict[str, Any] | None) -> dict[str, float | None] | None:
    if not payload:
        return None

    rain_inches = _current_open_meteo_field(
        payload,
        field_name="rain",
        transform=_normalize_open_meteo_inches,
    )
    showers_inches = _current_open_meteo_field(
        payload,
        field_name="showers",
        transform=_normalize_open_meteo_inches,
    )
    liquid_parts = [value for value in (rain_inches, showers_inches) if value is not None]
    liquid_inches = round_value(sum(liquid_parts), 3) if liquid_parts else None
    return {
        "rain_inches": rain_inches,
        "showers_inches": showers_inches,
        "liquid_inches": liquid_inches,
        "precipitation_inches": _current_open_meteo_field(
            payload,
            field_name="precipitation",
            transform=_normalize_open_meteo_inches,
        ),
        "snowfall_cm": _current_open_meteo_field(
            payload,
            field_name="snowfall",
            transform=_normalize_open_meteo_snowfall_cm,
        ),
    }


def _select_rain_probability_source(
    *,
    grid_properties: dict[str, Any],
    open_meteo_payload: dict[str, Any] | None,
    buckets: list[datetime],
) -> tuple[list[float], float | None, str]:
    open_meteo_hourly = _expand_open_meteo_rain_probability(open_meteo_payload, buckets)
    open_meteo_current = _current_open_meteo_rain_probability(open_meteo_payload)
    nws_rain = [
        _normalize_probability_value(value)
        for value in _expand_optional_grid(
            grid_properties,
            "probabilityOfPrecipitation",
            buckets,
        )
    ]

    if any(value is not None for value in open_meteo_hourly) or open_meteo_current is not None:
        selected_hourly = [
            float(open_meteo_hourly[index])
            if open_meteo_hourly[index] is not None
            else float(nws_rain[index] or 0.0)
            for index in range(len(buckets))
        ]
        current_value = open_meteo_current
        if current_value is None and selected_hourly:
            current_value = selected_hourly[0]
        return (selected_hourly, current_value, "open-meteo")

    if any(value is not None for value in nws_rain):
        selected_hourly = [float(value or 0.0) for value in nws_rain]
        return (selected_hourly, selected_hourly[0] if selected_hourly else None, "nws")

    return ([0.0 for _ in buckets], 0.0 if buckets else None, "unavailable")


def _select_rain_amount_source(
    *,
    open_meteo_payload: dict[str, Any] | None,
    nws_precipitation: list[float | None],
    buckets: list[datetime],
) -> tuple[list[float | None], float | None, str]:
    open_meteo_hourly = _expand_open_meteo_rain_amounts(open_meteo_payload, buckets)
    open_meteo_current = _current_open_meteo_rain_amounts(open_meteo_payload)
    open_meteo_liquid = [item.get("liquid_inches") for item in open_meteo_hourly]

    if any(value is not None for value in open_meteo_liquid) or (
        open_meteo_current is not None and open_meteo_current.get("liquid_inches") is not None
    ):
        selected_hourly = [
            open_meteo_liquid[index]
            if open_meteo_liquid[index] is not None
            else nws_precipitation[index]
            for index in range(len(buckets))
        ]
        current_value = open_meteo_current.get("liquid_inches") if open_meteo_current is not None else None
        if current_value is None and selected_hourly:
            current_value = selected_hourly[0]
        return (selected_hourly, current_value, "open-meteo")

    if any(value is not None for value in nws_precipitation):
        return (nws_precipitation, nws_precipitation[0] if nws_precipitation else None, "nws")

    return ([None for _ in buckets], None, "unavailable")


def _forecast_period_for_bucket(
    periods: list[dict[str, Any]],
    bucket_start: datetime,
) -> dict[str, Any]:
    bucket_utc = ensure_utc(bucket_start)
    nearest: dict[str, Any] | None = None
    nearest_delta: float | None = None

    for period in periods:
        start_raw = period.get("startTime")
        end_raw = period.get("endTime")
        if not start_raw or not end_raw:
            continue

        start = ensure_utc(datetime.fromisoformat(start_raw))
        end = ensure_utc(datetime.fromisoformat(end_raw))
        if start <= bucket_utc < end:
            return period

        delta = abs((start - bucket_utc).total_seconds())
        if nearest_delta is None or delta < nearest_delta:
            nearest = period
            nearest_delta = delta

    return nearest or {}


def _weather_annotations(values: list[Any]) -> list[dict[str, bool]]:
    output: list[dict[str, bool]] = []
    for period in values:
        flags = {"large_hail": False, "damaging_wind": False}
        if not period:
            output.append(flags)
            continue
        for entry in period:
            for attribute in entry.get("attributes", []):
                if attribute in flags:
                    flags[attribute] = True
        output.append(flags)
    return output


def _condition_from_forecast(short_forecast: str, daytime: bool | None = None) -> str:
    forecast = short_forecast.lower()
    if "thunder" in forecast:
        return "lightning-rainy"
    if "hail" in forecast:
        return "hail"
    if "rain" in forecast or "showers" in forecast or "drizzle" in forecast:
        return "rainy"
    if "fog" in forecast:
        return "fog"
    if "mostly cloudy" in forecast or "cloudy" in forecast or "overcast" in forecast:
        return "cloudy"
    if (
        "partly sunny" in forecast
        or "mostly sunny" in forecast
        or "partly cloudy" in forecast
        or "mostly clear" in forecast
        or "partly" in forecast
    ):
        return "partlycloudy"
    if "clear" in forecast:
        return "clear-night" if daytime is False else "sunny"
    if "sunny" in forecast:
        return "sunny"
    if "wind" in forecast:
        return "windy"
    return "cloudy"


def _condition_from_hour(hour: dict[str, Any]) -> str:
    if hour["tornado_probability"] > 0 or hour["hail_probability"] > 0:
        return "lightning-rainy"
    if hour["storm_probability"] > 0:
        return "lightning-rainy"
    if hour["rain_probability"] > 0:
        return "rainy"
    if hour["strong_wind_probability"] >= 30:
        return "windy"
    return _condition_from_forecast(hour["short_forecast"], hour.get("daytime"))


def _condition_priority(condition: str) -> int:
    normalized = condition.replace("_", "-").lower()
    priorities = {
        "lightning-rainy": 6,
        "rainy": 5,
        "windy": 4,
        "hail": 4,
        "cloudy": 3,
        "partlycloudy": 2,
        "clear-night": 1,
        "sunny": 1,
    }
    return priorities.get(normalized, 0)


def _representative_condition(items: list[dict[str, Any]]) -> str:
    if not items:
        return "cloudy"

    best_index = 0
    best_condition = items[0].get("condition") or _condition_from_hour(items[0])
    best_priority = _condition_priority(best_condition)

    for index, item in enumerate(items[1:], start=1):
        condition = item.get("condition") or _condition_from_hour(item)
        priority = _condition_priority(condition)
        if priority > best_priority:
            best_index = index
            best_condition = condition
            best_priority = priority
            continue
        if priority == best_priority and index < best_index:
            best_index = index
            best_condition = condition

    return best_condition


def _iso(value: datetime) -> str:
    return ensure_utc(value).isoformat()


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    if parsed != parsed:
        return default
    return parsed


def _parse_open_meteo_time(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    normalized = value.strip().replace("Z", "+00:00")
    try:
        return ensure_utc(datetime.fromisoformat(normalized))
    except ValueError:
        return None


def _open_meteo_precip_rate_in_per_hour(precip_mm_15m: float) -> float:
    if precip_mm_15m <= 0:
        return 0.0
    inches = millimeters_to_inches(precip_mm_15m) or 0.0
    return max(inches * 4.0, 0.0)


def _minute_rain_probability_from_explicit_signal(
    *,
    weather_code: int | None,
    rate_in_per_hour: float,
) -> float:
    precip_type = _precip_type_from_weather_code(weather_code, rate_in_per_hour)
    if precip_type in {"rain", "storm", "mix"} and rate_in_per_hour > 0.005:
        return 100.0
    return 0.0


def _precip_intensity_from_rate(rate_in_per_hour: float) -> str:
    if rate_in_per_hour <= 0.005:
        return "none"
    if rate_in_per_hour < 0.03:
        return "light"
    if rate_in_per_hour < 0.12:
        return "moderate"
    return "heavy"


def _precip_type_from_weather_code(weather_code: int | None, rate_in_per_hour: float) -> str:
    if rate_in_per_hour <= 0.005:
        return "none"
    if weather_code in THUNDER_WEATHER_CODES:
        return "storm"
    if weather_code in SNOW_WEATHER_CODES:
        return "snow"
    if weather_code in MIXED_WEATHER_CODES:
        return "mix"
    if weather_code in RAIN_WEATHER_CODES or weather_code is None:
        return "rain"
    return "rain"


def _storm_probability_from_weather_code(
    weather_code: int | None,
    precip_probability: float,
    hourly_storm_probability: float,
) -> float:
    if weather_code in THUNDER_WEATHER_CODES:
        return min(100.0, max(65.0, hourly_storm_probability, precip_probability))
    if precip_probability <= 0:
        return 0.0
    return min(100.0, max(0.0, hourly_storm_probability * 0.6))


def _hourly_probabilities_at(hours: list[dict[str, Any]], timestamp: datetime) -> tuple[float, float]:
    fallback_rain = _to_float(hours[0].get("rain_probability"), 0.0) if hours else 0.0
    fallback_storm = _to_float(hours[0].get("storm_probability"), 0.0) if hours else 0.0
    for hour in hours:
        start_raw = hour.get("start")
        end_raw = hour.get("end")
        if not isinstance(start_raw, str) or not isinstance(end_raw, str):
            continue
        try:
            start = ensure_utc(datetime.fromisoformat(start_raw))
            end = ensure_utc(datetime.fromisoformat(end_raw))
        except ValueError:
            continue
        if start <= timestamp < end:
            return (
                _to_float(hour.get("rain_probability"), fallback_rain),
                _to_float(hour.get("storm_probability"), fallback_storm),
            )
    return fallback_rain, fallback_storm


def _observation_age_minutes(
    observation_payload: dict[str, Any] | None,
    now: datetime,
) -> float | None:
    if not isinstance(observation_payload, dict):
        return None
    properties = observation_payload.get("properties")
    if not isinstance(properties, dict):
        return None
    observation_time = _parse_open_meteo_time(properties.get("timestamp"))
    if observation_time is None:
        return None
    return max(0.0, (now - observation_time).total_seconds() / 60.0)


def _is_fresh_nws_observation(
    observation_payload: dict[str, Any] | None,
    now: datetime,
) -> bool:
    age_minutes = _observation_age_minutes(observation_payload, now)
    if age_minutes is None:
        return True
    return age_minutes <= OBS_NOWCAST_MAX_AGE_MINUTES


def _select_freshest_nws_observation(
    observations: list[dict[str, Any]],
    now: datetime,
) -> dict[str, Any] | None:
    freshest: dict[str, Any] | None = None
    freshest_age: float | None = None
    for observation in observations:
        if not _is_fresh_nws_observation(observation, now):
            continue
        age_minutes = _observation_age_minutes(observation, now)
        if age_minutes is None:
            return observation
        if freshest is None or age_minutes < freshest_age:
            freshest = observation
            freshest_age = age_minutes
    return freshest


def _observation_confidence_from_age(age_minutes: float | None) -> float:
    if age_minutes is None:
        return 0.45
    if age_minutes <= 20:
        return 0.86
    if age_minutes <= 45:
        return 0.78
    if age_minutes <= 75:
        return 0.68
    if age_minutes <= OBS_NOWCAST_MAX_AGE_MINUTES:
        return 0.58
    return 0.45


def _precip_type_from_text(text: str) -> str:
    lowered = text.lower()
    if any(token in lowered for token in OBS_STORM_KEYWORDS):
        return "storm"
    if any(token in lowered for token in OBS_SNOW_KEYWORDS):
        return "snow"
    if any(token in lowered for token in OBS_MIXED_KEYWORDS):
        return "mix"
    if any(token in lowered for token in OBS_RAIN_KEYWORDS):
        return "rain"
    return "none"


def _intensity_from_text(text: str, *, raw_code: str | None = None) -> str:
    lowered = text.lower()
    if "heavy" in lowered:
        return "heavy"
    if "moderate" in lowered:
        return "moderate"
    if "light" in lowered:
        return "light"
    if raw_code and raw_code.startswith("+"):
        return "heavy"
    if raw_code and raw_code.startswith("-"):
        return "light"
    return "moderate"


def _observation_precip_signature(
    observation_payload: dict[str, Any] | None,
) -> tuple[str, str]:
    if not isinstance(observation_payload, dict):
        return ("none", "none")
    properties = observation_payload.get("properties")
    if not isinstance(properties, dict):
        return ("none", "none")

    best_type = "none"
    best_intensity = "none"
    type_rank = {"none": 0, "rain": 1, "snow": 2, "mix": 3, "storm": 4}
    present_weather = properties.get("presentWeather")
    if isinstance(present_weather, list):
        for entry in present_weather:
            if not isinstance(entry, dict):
                continue
            weather_text = str(entry.get("weather") or "")
            derived_type = _precip_type_from_text(weather_text)
            if derived_type == "none":
                continue
            intensity = _intensity_from_text(
                str(entry.get("intensity") or ""),
                raw_code=str(entry.get("rawString") or "") or None,
            )
            if type_rank.get(derived_type, 0) >= type_rank.get(best_type, 0):
                best_type = derived_type
                if _intensity_rank(intensity) >= _intensity_rank(best_intensity):
                    best_intensity = intensity

    if best_type != "none":
        return (best_type, best_intensity if best_intensity != "none" else "moderate")

    description = str(properties.get("textDescription") or "")
    fallback_type = _precip_type_from_text(description)
    if fallback_type == "none":
        return ("none", "none")
    return (fallback_type, _intensity_from_text(description))


def _rate_from_precip_type_and_intensity(precip_type: str, intensity: str) -> float:
    if precip_type == "none":
        return 0.0
    if precip_type in {"snow", "mix"}:
        rates = {"light": 0.01, "moderate": 0.03, "heavy": 0.07}
        return rates.get(intensity, 0.03)
    rates = {"light": 0.02, "moderate": 0.08, "heavy": 0.20}
    return rates.get(intensity, 0.08)


def _build_nws_observation_nowcast_series(
    observation_payload: dict[str, Any] | None,
    hours: list[dict[str, Any]],
    now: datetime,
) -> list[dict[str, Any]]:
    if not isinstance(observation_payload, dict):
        return []
    properties = observation_payload.get("properties")
    if not isinstance(properties, dict):
        return []

    age_minutes = _observation_age_minutes(observation_payload, now)
    if age_minutes is not None and age_minutes > OBS_NOWCAST_MAX_AGE_MINUTES:
        return []

    observed_type, observed_intensity = _observation_precip_signature(observation_payload)
    observed_active = observed_type != "none"
    freshness = _observation_confidence_from_age(age_minutes)

    point_anchor = ensure_utc(
        now
        - timedelta(
            minutes=now.minute % NOWCAST_POINT_MINUTES,
            seconds=now.second,
            microseconds=now.microsecond,
        )
    )

    points: list[dict[str, Any]] = []
    for index in range(NOWCAST_HORIZON_BUCKETS * NOWCAST_POINTS_PER_BUCKET):
        point_start = point_anchor + timedelta(minutes=index * NOWCAST_POINT_MINUTES)
        point_end = point_start + timedelta(minutes=NOWCAST_POINT_MINUTES)
        hourly_rain_probability, hourly_storm_probability = _hourly_probabilities_at(hours, point_start)

        if observed_active:
            observed_decay = max(0.0, 1.0 - (index * 0.08))
            observed_rain_probability = max(20.0, 92.0 * freshness * observed_decay)
            rain_probability = min(100.0, max(hourly_rain_probability, observed_rain_probability))
        else:
            rain_probability = min(100.0, max(0.0, hourly_rain_probability))

        if observed_active and observed_type == "storm":
            observed_decay = max(0.0, 1.0 - (index * 0.08))
            observed_storm_probability = max(15.0, 75.0 * freshness * observed_decay)
            storm_probability = min(100.0, max(hourly_storm_probability, observed_storm_probability))
        elif observed_active:
            storm_probability = min(100.0, max(hourly_storm_probability, rain_probability * 0.35))
        else:
            storm_probability = min(100.0, max(0.0, hourly_storm_probability))

        if rain_probability < NOWCAST_ACTIVE_PROBABILITY_THRESHOLD:
            precip_type = "none"
            precip_intensity = "none"
        elif observed_active and index < 6:
            precip_type = observed_type
            precip_intensity = observed_intensity
        elif storm_probability >= max(35.0, rain_probability * 0.65):
            precip_type = "storm"
            precip_intensity = "moderate" if rain_probability >= 50.0 else "light"
        else:
            precip_type = "rain"
            if rain_probability >= 80.0:
                precip_intensity = "heavy"
            elif rain_probability >= 45.0:
                precip_intensity = "moderate"
            else:
                precip_intensity = "light"

        precip_rate = _rate_from_precip_type_and_intensity(precip_type, precip_intensity)
        point_confidence = max(0.4, freshness - (index * 0.02))

        points.append(
            {
                "start": _iso(point_start),
                "end": _iso(point_end),
                "precip_probability": round_value(rain_probability, 1),
                "precip_intensity": precip_intensity,
                "precip_rate": round_value(precip_rate, 3),
                "precip_type": precip_type,
                "storm_probability": round_value(storm_probability, 1),
                "source_confidence": round_value(point_confidence, 2),
            }
        )
    return points


def _normalize_direct_minute_series(payload: dict[str, Any] | None) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []
    raw_series = payload.get("series")
    if not isinstance(raw_series, list):
        return []

    normalized: list[dict[str, Any]] = []
    for item in raw_series:
        if not isinstance(item, dict):
            continue
        start = _parse_open_meteo_time(item.get("start"))
        end = _parse_open_meteo_time(item.get("end"))
        if start is None or end is None or end <= start:
            continue

        precip_probability = min(100.0, max(0.0, _to_float(item.get("precip_probability"), 0.0)))
        storm_probability = min(100.0, max(0.0, _to_float(item.get("storm_probability"), 0.0)))
        precip_type = str(item.get("precip_type") or "none").lower()
        precip_intensity = str(item.get("precip_intensity") or "none").lower()
        if precip_probability < NOWCAST_ACTIVE_PROBABILITY_THRESHOLD:
            precip_type = "none"
            precip_intensity = "none"

        normalized.append(
            {
                "start": _iso(start),
                "end": _iso(end),
                "precip_probability": round_value(precip_probability, 1),
                "precip_intensity": precip_intensity,
                "precip_rate": round_value(max(0.0, _to_float(item.get("precip_rate"), 0.0)), 3),
                "precip_type": precip_type,
                "storm_probability": round_value(storm_probability, 1),
                "source_confidence": round_value(
                    min(1.0, max(0.0, _to_float(item.get("source_confidence"), 0.5))),
                    2,
                ),
            }
        )

    normalized.sort(key=lambda point: point["start"])
    return normalized


def _weatherkit_probability_unit_interval(value: Any) -> float:
    parsed = _to_float(value, 0.0)
    if parsed > 1.0:
        parsed = parsed / 100.0
    return min(1.0, max(0.0, parsed))


def _weatherkit_weather_code(
    *,
    condition: str | None,
    precipitation_type: str | None,
    precip_mm_1m: float,
) -> int | None:
    if precip_mm_1m <= 0:
        return None

    condition_text = (condition or "").strip().lower()
    precipitation_type_text = (precipitation_type or "").strip().lower()
    combined = f"{condition_text} {precipitation_type_text}"

    if any(keyword in combined for keyword in ("thunder", "storm", "lightning", "hail")):
        return 95
    if any(keyword in combined for keyword in ("snow", "flurr", "blizzard")):
        return 71
    if any(keyword in combined for keyword in ("sleet", "mix", "mixed", "freezing")):
        return 68
    if any(keyword in combined for keyword in ("rain", "showers", "drizzle", "precip")):
        return 61
    return 61


def _normalize_weatherkit_minutely_buckets(payload: dict[str, Any] | None) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []

    next_hour = payload.get("forecastNextHour")
    if isinstance(next_hour, dict):
        raw_minutes = next_hour.get("minutes")
        raw_summary = next_hour.get("summary")
    else:
        raw_minutes = payload.get("minutes")
        raw_summary = payload.get("summary")

    if not isinstance(raw_minutes, list) or not raw_minutes:
        return []

    summary_condition = None
    if isinstance(raw_summary, list) and raw_summary:
        head = raw_summary[0]
        if isinstance(head, dict):
            raw_condition = head.get("condition")
            if isinstance(raw_condition, str) and raw_condition.strip():
                summary_condition = raw_condition.strip()

    aggregated: dict[datetime, dict[str, Any]] = {}
    for minute in raw_minutes:
        if not isinstance(minute, dict):
            continue
        start = _parse_open_meteo_time(minute.get("startTime") or minute.get("forecastStart"))
        if start is None:
            continue

        intensity_mm_per_hour = max(_to_float(minute.get("precipitationIntensity"), 0.0), 0.0)
        precip_chance = _weatherkit_probability_unit_interval(minute.get("precipitationChance"))
        precip_mm_1m = max(intensity_mm_per_hour * precip_chance / 60.0, 0.0)
        bucket_start = start - timedelta(
            minutes=start.minute % NOWCAST_BUCKET_MINUTES,
            seconds=start.second,
            microseconds=start.microsecond,
        )
        bucket_end = bucket_start + timedelta(minutes=NOWCAST_BUCKET_MINUTES)
        key = ensure_utc(bucket_start)
        bucket = aggregated.setdefault(
            key,
            {
                "start": key,
                "end": ensure_utc(bucket_end),
                "precip_mm_15m": 0.0,
                "weather_codes": [],
            },
        )
        bucket["precip_mm_15m"] = max(_to_float(bucket.get("precip_mm_15m"), 0.0), 0.0) + precip_mm_1m
        weather_code = _weatherkit_weather_code(
            condition=minute.get("condition") or summary_condition,
            precipitation_type=minute.get("precipitationType"),
            precip_mm_1m=precip_mm_1m,
        )
        if weather_code is not None:
            bucket["weather_codes"].append(weather_code)

    buckets: list[dict[str, Any]] = []
    for key in sorted(aggregated):
        bucket = aggregated[key]
        codes = [
            int(code)
            for code in bucket.get("weather_codes", [])
            if isinstance(code, int) or (isinstance(code, float) and code.is_integer())
        ]
        weather_code = max(set(codes), key=codes.count) if codes else None
        buckets.append(
            {
                "start": bucket["start"],
                "end": bucket["end"],
                "precip_mm_15m": round_value(_to_float(bucket["precip_mm_15m"], 0.0), 4),
                "weather_code": weather_code,
            }
        )
    return buckets


def _normalize_open_meteo_minutely_buckets(payload: dict[str, Any] | None) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []
    minutely = payload.get("minutely_15")
    if not isinstance(minutely, dict):
        return []

    raw_times = minutely.get("time")
    raw_precip = minutely.get("precipitation")
    raw_codes = minutely.get("weather_code")
    if not isinstance(raw_times, list) or not isinstance(raw_precip, list):
        return []

    parsed_times: list[datetime | None] = [_parse_open_meteo_time(raw_time) for raw_time in raw_times]
    buckets: list[dict[str, Any]] = []
    for index, (start_time, raw_value) in enumerate(zip(parsed_times, raw_precip, strict=False)):
        if start_time is None:
            continue

        end_time: datetime | None = None
        for look_ahead in range(index + 1, len(parsed_times)):
            if parsed_times[look_ahead] is not None:
                end_time = parsed_times[look_ahead]
                break
        if end_time is None or end_time <= start_time:
            end_time = start_time + timedelta(minutes=NOWCAST_BUCKET_MINUTES)

        weather_code_raw = (
            raw_codes[index]
            if isinstance(raw_codes, list) and index < len(raw_codes)
            else None
        )
        if weather_code_raw is None:
            weather_code = None
        else:
            try:
                weather_code = int(weather_code_raw)
            except (TypeError, ValueError):
                weather_code = None

        buckets.append(
            {
                "start": start_time,
                "end": end_time,
                "precip_mm_15m": max(_to_float(raw_value, 0.0), 0.0),
                "weather_code": weather_code,
            }
        )

    buckets.sort(key=lambda bucket: bucket["start"])
    return buckets


def _normalize_minutely_buckets(payload: dict[str, Any] | None) -> list[dict[str, Any]]:
    open_meteo = _normalize_open_meteo_minutely_buckets(payload)
    if open_meteo:
        return open_meteo
    return _normalize_weatherkit_minutely_buckets(payload)


def _select_nowcast_buckets_for_horizon(
    buckets: list[dict[str, Any]],
    now: datetime,
) -> list[dict[str, Any]]:
    if not buckets:
        return []

    start_index: int | None = None
    for index, bucket in enumerate(buckets):
        if bucket["start"] <= now < bucket["end"]:
            start_index = index
            break

    if start_index is None:
        for index, bucket in enumerate(buckets):
            if bucket["start"] > now:
                start_index = max(index - 1, 0)
                break

    if start_index is None:
        start_index = max(len(buckets) - NOWCAST_HORIZON_BUCKETS, 0)

    return buckets[start_index : start_index + NOWCAST_HORIZON_BUCKETS]


def _expand_nowcast_minute_series(
    buckets: list[dict[str, Any]],
    hours: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    minute_series: list[dict[str, Any]] = []
    for bucket in buckets:
        interval_start = bucket["start"]
        interval_end = bucket["end"]
        if interval_end <= interval_start:
            continue

        weather_code = bucket["weather_code"]
        precip_mm_15m = bucket["precip_mm_15m"]
        rate_in_per_hour = _open_meteo_precip_rate_in_per_hour(precip_mm_15m)
        intensity = _precip_intensity_from_rate(rate_in_per_hour)
        precip_type = _precip_type_from_weather_code(weather_code, rate_in_per_hour)
        source_confidence = 0.9 if weather_code is not None else 0.75

        for step in range(NOWCAST_POINTS_PER_BUCKET):
            point_start = interval_start + timedelta(minutes=NOWCAST_POINT_MINUTES * step)
            point_end = min(
                interval_end,
                point_start + timedelta(minutes=NOWCAST_POINT_MINUTES),
            )
            if point_end <= point_start:
                continue

            _, hourly_storm_probability = _hourly_probabilities_at(
                hours,
                point_start,
            )
            precip_probability = _minute_rain_probability_from_explicit_signal(
                weather_code=weather_code,
                rate_in_per_hour=rate_in_per_hour,
            )
            storm_probability = _storm_probability_from_weather_code(
                weather_code,
                precip_probability,
                hourly_storm_probability,
            )

            minute_series.append(
                {
                    "start": _iso(point_start),
                    "end": _iso(point_end),
                    "precip_probability": round_value(precip_probability, 1),
                    "precip_intensity": intensity,
                    "precip_rate": round_value(rate_in_per_hour, 3),
                    "precip_type": precip_type,
                    "storm_probability": round_value(storm_probability, 1),
                    "source_confidence": round_value(source_confidence, 2),
                }
            )

    minute_series.sort(key=lambda item: item["start"])
    return minute_series


def _nowcast_activity(value: dict[str, Any]) -> bool:
    if _to_float(value.get("precip_rate"), 0.0) > 0.005:
        return True

    precip_type = str(value.get("precip_type") or "none").strip().lower()
    precip_intensity = str(value.get("precip_intensity") or "none").strip().lower()
    if precip_type != "none" or precip_intensity != "none":
        return True

    return False


def _spc_hail_outlook_peak(severe_matches: dict[str, list[Any]]) -> float | None:
    peak = 0.0
    found = False
    for match in severe_matches.get("hail", []):
        found = True
        peak = max(peak, float(getattr(match, "probability_percent", 0.0) or 0.0))
    if not found or peak <= 0:
        return None
    return round_value(peak, 1)


def _hourly_hail_probability_from_nws(
    *,
    thunder_probability: float,
    annotation_large_hail: bool,
    short_forecast: str,
) -> float:
    """Derive hourly hail display from NWS grid signals, not SPC outlook polygons."""
    forecast = short_forecast.lower()
    if not annotation_large_hail and "hail" not in forecast:
        return 0.0

    thunder = max(0.0, float(thunder_probability or 0.0))
    if "hail" in forecast and thunder < 30.0:
        thunder = 30.0
    if annotation_large_hail and thunder < 25.0:
        thunder = 25.0
    return round_value(min(thunder, 100.0), 1)


def _resolve_nowcast_hail_tornado_maxima() -> tuple[float, float]:
    # Minute nowcast models rain/storm timing only. Strategic SPC hail/tornado
    # belongs on longer horizons, not the 1h precipitation surface.
    return 0.0, 0.0


def _build_hail_signal(
    horizon_items: list[dict[str, Any]],
    spc_hail_outlook_percent: float | None,
) -> dict[str, Any]:
    nws_large_hail_hours = sum(1 for item in horizon_items if item.get("annotation_large_hail"))
    forecast_mentions_hail = any(
        "hail" in str(item.get("short_forecast") or "").lower() for item in horizon_items
    )
    spc_outlook = (
        round_value(float(spc_hail_outlook_percent), 1)
        if spc_hail_outlook_percent is not None and spc_hail_outlook_percent > 0
        else None
    )
    active = nws_large_hail_hours > 0 or forecast_mentions_hail or spc_outlook is not None
    return {
        "active": active,
        "nws_large_hail_hours": nws_large_hail_hours,
        "forecast_mentions_hail": forecast_mentions_hail,
        "spc_outlook_percent": spc_outlook,
    }


def _hail_signal_summary_text(hail_signal: dict[str, Any]) -> str | None:
    if not hail_signal.get("active"):
        return None
    if hail_signal.get("nws_large_hail_hours", 0) > 0:
        hours = int(hail_signal["nws_large_hail_hours"])
        if hours == 1:
            return "Large hail flagged (NWS grid) in next hour"
        return f"Large hail flagged (NWS grid) in next {hours} hours"
    if hail_signal.get("forecast_mentions_hail"):
        return "Hail mentioned in hourly forecast"
    spc_outlook = hail_signal.get("spc_outlook_percent")
    if spc_outlook is not None:
        return f"SPC hail outlook {float(spc_outlook):.0f}% area (not hourly PoP)"
    return None


def _intensity_rank(intensity: str | None) -> int:
    order = {"none": 0, "light": 1, "moderate": 2, "heavy": 3}
    return order.get((intensity or "none").lower(), 0)


def _precip_type_label(value: str | None) -> str:
    labels = {
        "rain": "Rain",
        "storm": "Storm",
        "snow": "Snow",
        "mix": "Mixed precipitation",
        "none": "No precipitation",
    }
    return labels.get((value or "none").lower(), "Precipitation")


def _compute_nowcast_timing(
    minute_series: list[dict[str, Any]],
    now: datetime,
) -> tuple[int | None, int | None, str | None, str | None]:
    if not minute_series:
        return (None, None, None, None)

    points: list[dict[str, Any]] = []
    for item in minute_series:
        start = _parse_open_meteo_time(item.get("start"))
        end = _parse_open_meteo_time(item.get("end"))
        if start is None or end is None or end <= start:
            continue
        points.append({"start": start, "end": end, "point": item})
    if not points:
        return (None, None, None, None)

    current_index: int | None = None
    for index, item in enumerate(points):
        if item["start"] <= now < item["end"]:
            current_index = index
            break
    if current_index is None:
        for index, item in enumerate(points):
            if item["start"] > now:
                current_index = index
                break
    if current_index is None:
        current_index = len(points) - 1

    current_item = points[current_index]
    current_active = _nowcast_activity(current_item["point"]) and current_item["end"] > now

    if current_active:
        run_start_index = current_index
        next_start_minutes = 0
    else:
        run_start_index = None
        for index in range(current_index, len(points)):
            if points[index]["end"] <= now:
                continue
            if _nowcast_activity(points[index]["point"]):
                run_start_index = index
                break
        if run_start_index is None:
            return (None, None, None, None)
        start_delta = (points[run_start_index]["start"] - now).total_seconds() / 60.0
        next_start_minutes = max(0, round(start_delta))

    run_end_index: int | None = None
    for index in range(run_start_index, len(points)):
        if not _nowcast_activity(points[index]["point"]):
            run_end_index = index
            break

    next_stop_minutes: int | None = None
    if run_end_index is not None:
        stop_delta = (points[run_end_index]["start"] - now).total_seconds() / 60.0
        next_stop_minutes = max(0, round(stop_delta))

    active_slice = points[run_start_index:run_end_index] if run_end_index is not None else points[run_start_index:]
    if not active_slice:
        return (next_start_minutes, next_stop_minutes, None, None)

    peak_point = max(
        active_slice,
        key=lambda item: (
            _intensity_rank(str(item["point"].get("precip_intensity"))),
            _to_float(item["point"].get("precip_rate"), 0.0),
            _to_float(item["point"].get("precip_probability"), 0.0),
        ),
    )["point"]
    next_type = peak_point.get("precip_type")
    next_intensity = peak_point.get("precip_intensity")
    return (
        next_start_minutes,
        next_stop_minutes,
        str(next_type) if next_type is not None else None,
        str(next_intensity) if next_intensity is not None else None,
    )


class SnapshotBuilder:
    def __init__(
        self,
        http_cache: HttpDocumentCache,
        spc_client: SpcClient,
        request_timeout_seconds: float,
        user_agent: str,
        http_cache_ttl_seconds: int,
        weatherkit: WeatherKitSettings,
    ) -> None:
        self._http_cache = http_cache
        self._spc_client = spc_client
        self._request_timeout_seconds = request_timeout_seconds
        self._user_agent = user_agent
        self._http_cache_ttl_seconds = http_cache_ttl_seconds
        self._weatherkit = weatherkit

    def _create_weatherkit_token(self) -> str:
        if not self._weatherkit.enabled:
            raise RuntimeError("WeatherKit credentials are not configured")
        issued_at = int(datetime.now(tz=UTC).timestamp())
        expires_at = issued_at + 3600
        payload = {
            "iss": self._weatherkit.team_id,
            "iat": issued_at,
            "exp": expires_at,
            "sub": self._weatherkit.service_id,
        }
        headers = {
            "kid": self._weatherkit.key_id,
            "id": f"{self._weatherkit.team_id}.{self._weatherkit.service_id}",
            "typ": "JWT",
        }
        token = jwt.encode(
            payload,
            self._weatherkit.private_key,
            algorithm="ES256",
            headers=headers,
        )
        return token if isinstance(token, str) else token.decode("utf-8")

    async def _fetch_weatherkit_minute_nowcast(
        self,
        client: httpx.AsyncClient,
        lat: float,
        lon: float,
    ) -> dict[str, Any]:
        token = self._create_weatherkit_token()
        request_headers = {"Authorization": f"Bearer {token}"}
        params: dict[str, str] = {
            "dataSets": "forecastNextHour",
            "timezone": "GMT",
        }
        if self._weatherkit.country_code:
            params["countryCode"] = self._weatherkit.country_code
        response = await client.get(
            WEATHERKIT_WEATHER_URL.format(
                language=self._weatherkit.language,
                lat=lat,
                lon=lon,
            ),
            headers=request_headers,
            params=params,
        )
        response.raise_for_status()
        return response.json()

    async def _fetch_open_meteo_minute_nowcast(
        self,
        client: httpx.AsyncClient,
        lat: float,
        lon: float,
    ) -> dict[str, Any]:
        return await self._http_cache.get_json(
            client,
            OPEN_METEO_MINUTE_NOWCAST_URL.format(lat=lat, lon=lon),
            self._http_cache_ttl_seconds,
        )

    async def _fetch_nws_latest_observation(
        self,
        client: httpx.AsyncClient,
        point: dict[str, Any],
    ) -> dict[str, Any] | None:
        observation_stations_url = point.get("properties", {}).get("observationStations")
        if not isinstance(observation_stations_url, str) or not observation_stations_url:
            return None

        stations_payload = await self._http_cache.get_json(
            client,
            observation_stations_url,
            self._http_cache_ttl_seconds,
        )
        station_features = stations_payload.get("features")
        if not isinstance(station_features, list):
            return None

        now = datetime.now(UTC)
        freshest: dict[str, Any] | None = None
        freshest_age: float | None = None

        for feature in station_features[:NWS_OBSERVATION_STATION_PROBE_LIMIT]:
            if not isinstance(feature, dict):
                continue
            station_id = feature.get("id")
            if not isinstance(station_id, str) or not station_id:
                continue
            try:
                observation = await self._http_cache.get_json(
                    client,
                    f"{station_id}/observations/latest",
                    self._http_cache_ttl_seconds,
                )
            except httpx.HTTPError:
                continue
            if not _is_fresh_nws_observation(observation, now):
                continue
            age_minutes = _observation_age_minutes(observation, now)
            if age_minutes is None:
                return observation
            if freshest is None or age_minutes < freshest_age:
                freshest = observation
                freshest_age = age_minutes

        return freshest

    async def build_snapshot(
        self,
        lat: float,
        lon: float,
        label: str | None,
        wind_threshold_mph: int,
    ) -> dict[str, Any]:
        degraded_sources: list[str] = []
        headers = {
            "User-Agent": self._user_agent,
            "Accept": "application/geo+json, application/ld+json, application/json",
        }
        async with httpx.AsyncClient(
            headers=headers,
            timeout=self._request_timeout_seconds,
            follow_redirects=True,
        ) as client:
            minute_nowcast: dict[str, Any] | None = None
            minute_nowcast_source = "forecast-only"
            try:
                open_meteo_forecast = await self._http_cache.get_json(
                    client,
                    OPEN_METEO_FORECAST_URL.format(lat=lat, lon=lon),
                    self._http_cache_ttl_seconds,
                )
            except httpx.HTTPError as err:
                LOGGER.warning("Open-Meteo forecast fetch failed for %s,%s: %s", lat, lon, err)
                open_meteo_forecast = None
                degraded_sources.append("open_meteo_forecast")
            if self._weatherkit.enabled:
                try:
                    minute_nowcast = await self._fetch_weatherkit_minute_nowcast(client, lat, lon)
                    minute_nowcast_source = "apple-weatherkit"
                except httpx.HTTPError as err:
                    LOGGER.warning("WeatherKit minute nowcast fetch failed for %s,%s: %s", lat, lon, err)
                    minute_nowcast = None
                    degraded_sources.append("minute_nowcast_weatherkit")
                    if self._weatherkit.fallback_open_meteo:
                        try:
                            minute_nowcast = await self._fetch_open_meteo_minute_nowcast(client, lat, lon)
                            minute_nowcast_source = "open-meteo-fallback"
                        except httpx.HTTPError as fallback_err:
                            LOGGER.warning(
                                "Open-Meteo minute nowcast fallback fetch failed for %s,%s: %s",
                                lat,
                                lon,
                                fallback_err,
                            )
                            degraded_sources.append("minute_nowcast_open_meteo_fallback")
            elif self._weatherkit.fallback_open_meteo:
                try:
                    minute_nowcast = await self._fetch_open_meteo_minute_nowcast(client, lat, lon)
                    minute_nowcast_source = "open-meteo-fallback"
                except httpx.HTTPError as err:
                    LOGGER.warning(
                        "Open-Meteo minute nowcast fallback fetch failed for %s,%s: %s",
                        lat,
                        lon,
                        err,
                    )
                    minute_nowcast = None
                    degraded_sources.append("minute_nowcast_open_meteo_fallback")

            point = await self._http_cache.get_json(
                client,
                NWS_POINT_URL.format(lat=lat, lon=lon),
                self._http_cache_ttl_seconds,
            )
            grid_url = point["properties"]["forecastGridData"]
            hourly_url = point["properties"]["forecastHourly"]
            alerts_url = NWS_ALERTS_URL.format(lat=lat, lon=lon)

            grid = await self._http_cache.get_json(client, grid_url, self._http_cache_ttl_seconds)
            hourly_forecast = await self._http_cache.get_json(
                client,
                hourly_url,
                self._http_cache_ttl_seconds,
            )
            try:
                alerts = await self._http_cache.get_json(
                    client,
                    alerts_url,
                    self._http_cache_ttl_seconds,
                )
            except httpx.HTTPError as err:
                LOGGER.warning("Alerts fetch failed for %s: %s", alerts_url, err)
                alerts = {"features": []}
                degraded_sources.append("alerts")

            try:
                severe_matches = await self._load_severe_matches(client, lat, lon)
            except Exception as err:
                LOGGER.warning("SPC severe match lookup failed for %s,%s: %s", lat, lon, err)
                severe_matches = {}
                degraded_sources.append("spc")

            try:
                nws_observation = await self._fetch_nws_latest_observation(client, point)
            except httpx.HTTPError as err:
                LOGGER.warning("NWS observation fetch failed for %s,%s: %s", lat, lon, err)
                nws_observation = None
                degraded_sources.append("nws_observation")

        return self._compose_snapshot(
            point=point,
            grid=grid,
            hourly_forecast=hourly_forecast,
            alerts=alerts,
            severe_matches=severe_matches,
            open_meteo_forecast=open_meteo_forecast,
            minute_nowcast=minute_nowcast,
            minute_nowcast_source=minute_nowcast_source,
            nws_observation=nws_observation,
            requested_label=label,
            wind_threshold_mph=wind_threshold_mph,
            degraded_sources=degraded_sources,
        )

    async def _load_severe_matches(
        self,
        client: httpx.AsyncClient,
        lat: float,
        lon: float,
    ) -> dict[str, list[Any]]:
        results: dict[str, list[Any]] = defaultdict(list)
        for day in (1, 2):
            for hazard in ("hail", "torn", "wind"):
                match = await self._spc_client.get_hazard_match(
                    client,
                    day=day,
                    hazard=hazard,
                    lon=lon,
                    lat=lat,
                )
                if match:
                    results[hazard].append(match)
        return results

    def _compose_snapshot(
        self,
        *,
        point: dict[str, Any],
        grid: dict[str, Any],
        hourly_forecast: dict[str, Any],
        alerts: dict[str, Any],
        severe_matches: dict[str, list[Any]],
        open_meteo_forecast: dict[str, Any] | None,
        minute_nowcast: dict[str, Any] | None,
        minute_nowcast_source: str,
        nws_observation: dict[str, Any] | None,
        requested_label: str | None,
        wind_threshold_mph: int,
        degraded_sources: list[str],
    ) -> dict[str, Any]:
        local_timezone = point["properties"]["timeZone"]
        now = datetime.now(UTC)
        timeline = [ensure_utc(item) for item in hourly_timeline(now, 48)]
        grid_properties = grid["properties"]
        wind_field = WIND_THRESHOLD_FIELD[wind_threshold_mph]

        expanded_temperature = [
            round_value(celsius_to_fahrenheit(value), 1)
            for value in _expand_grid(grid_properties["temperature"]["values"], timeline)
        ]
        expanded_storm = [
            round_value(float(value or 0), 1)
            for value in _expand_optional_grid(grid_properties, "probabilityOfThunder", timeline)
        ]
        expanded_wind = [
            round_value(float(value or 0), 1)
            for value in _expand_optional_grid(grid_properties, wind_field, timeline)
        ]
        expanded_gust = [
            round_value(kmh_to_mph(value), 1)
            for value in _expand_optional_grid(grid_properties, "windGust", timeline)
        ]
        # Hourly forecast strings (e.g. "15 mph") are rounded and often repeat across slots; the
        # grid exposes quantitative windSpeed in km/h aligned with the same timeline as temperature.
        expanded_sustained_wind_mph = [
            round_value(kmh_to_mph(value), 1)
            for value in _expand_optional_grid(grid_properties, "windSpeed", timeline)
        ]
        expanded_cloud_cover = [
            round_value(float(value), 1) if value is not None else None
            for value in _expand_optional_grid(grid_properties, "skyCover", timeline)
        ]
        expanded_uv_index, current_uv_index, uv_source = _select_uv_index_source(
            grid_properties=grid_properties,
            open_meteo_payload=open_meteo_forecast,
            buckets=timeline,
        )
        expanded_precipitation_nws = [
            round_value(millimeters_to_inches(value), 3)
            for value in _expand_optional_grid(grid_properties, "quantitativePrecipitation", timeline)
        ]
        expanded_rain_probability, current_rain_probability, rain_probability_source = (
            _select_rain_probability_source(
                grid_properties=grid_properties,
                open_meteo_payload=open_meteo_forecast,
                buckets=timeline,
            )
        )
        expanded_precipitation, current_precipitation_inches, rain_amount_source = _select_rain_amount_source(
            open_meteo_payload=open_meteo_forecast,
            nws_precipitation=expanded_precipitation_nws,
            buckets=timeline,
        )
        weather_values = _expand_optional_grid(grid_properties, "weather", timeline)
        annotations = _weather_annotations(weather_values)

        hourly_periods = hourly_forecast["properties"]["periods"][:48]
        severe_hourly = self._build_severe_hourly(timeline, severe_matches)
        alerts_payload = self._build_alerts_payload(alerts)

        hours: list[dict[str, Any]] = []
        for index, bucket_start in enumerate(timeline):
            forecast_period = _forecast_period_for_bucket(hourly_periods, bucket_start)
            bucket_end = bucket_start + timedelta(hours=1)
            severe = severe_hourly[index]
            rain_probability = float(expanded_rain_probability[index] or 0)
            nws_thunder_probability = float(expanded_storm[index] or 0)
            storm_probability = max(nws_thunder_probability, severe["storm_probability"])
            hail_probability = _hourly_hail_probability_from_nws(
                thunder_probability=nws_thunder_probability,
                annotation_large_hail=annotations[index]["large_hail"],
                short_forecast=forecast_period.get("shortForecast") or "",
            )
            humidity_percent = ((forecast_period.get("relativeHumidity", {}) or {}).get("value"))
            wind_speed_mph = expanded_sustained_wind_mph[index]
            if wind_speed_mph is None:
                wind_speed_mph = parse_wind_speed_mph(forecast_period.get("windSpeed"))
            feels_like = apparent_temperature_components_f(
                temperature_f=expanded_temperature[index],
                humidity_percent=humidity_percent,
                wind_speed_mph=wind_speed_mph,
                cloud_cover_percent=expanded_cloud_cover[index],
                daytime=forecast_period.get("isDaytime"),
                uv_index=expanded_uv_index[index],
                weather_condition_text=forecast_period.get("shortForecast"),
                precipitation_inches=expanded_precipitation[index],
            )
            hour_condition = _condition_from_hour(
                {
                    "tornado_probability": severe["tornado_probability"],
                    "hail_probability": hail_probability,
                    "storm_probability": storm_probability,
                    "rain_probability": rain_probability,
                    "strong_wind_probability": float(expanded_wind[index] or 0),
                    "short_forecast": forecast_period.get("shortForecast") or "",
                    "daytime": forecast_period.get("isDaytime"),
                }
            )
            hours.append(
                {
                    "start": _iso(bucket_start),
                    "end": _iso(bucket_end),
                    "temperature_f": expanded_temperature[index],
                    "humidity_percent": humidity_percent,
                    "wind_speed_mph": wind_speed_mph,
                    "cloud_cover_percent": expanded_cloud_cover[index],
                    "daytime": forecast_period.get("isDaytime"),
                    "uv_index": expanded_uv_index[index],
                    "precipitation_inches": expanded_precipitation[index],
                    "feels_like_basic_f": round_value(feels_like["feels_like_basic"], 1),
                    "feels_like_enhanced_f": round_value(feels_like["feels_like_enhanced"], 1),
                    "feels_like_shade_f": round_value(feels_like["feels_like_shade"], 1),
                    "apparent_temperature_f": round_value(feels_like["feels_like_enhanced"], 1),
                    "rain_probability": rain_probability,
                    "storm_probability": storm_probability,
                    "strong_wind_probability": float(expanded_wind[index] or 0),
                    "hail_probability": hail_probability,
                    "tornado_probability": severe["tornado_probability"],
                    "severe_wind_probability": severe["severe_wind_probability"],
                    "wind_gust_mph": expanded_gust[index],
                    "condition": hour_condition,
                    "short_forecast": forecast_period.get("shortForecast") or "",
                    "icon": forecast_period.get("icon"),
                    "annotation_large_hail": annotations[index]["large_hail"],
                    "annotation_damaging_wind": annotations[index]["damaging_wind"],
                }
            )

        current_period = _forecast_period_for_bucket(hourly_periods, timeline[0]) if timeline else {}
        current_humidity = ((current_period.get("relativeHumidity", {}) or {}).get("value"))
        current_wind_speed = (
            expanded_sustained_wind_mph[0]
            if expanded_sustained_wind_mph
            else None
        )
        if current_wind_speed is None:
            current_wind_speed = parse_wind_speed_mph(current_period.get("windSpeed"))
        current_feels_like = apparent_temperature_components_f(
            temperature_f=current_period.get("temperature"),
            humidity_percent=current_humidity,
            wind_speed_mph=current_wind_speed,
            cloud_cover_percent=expanded_cloud_cover[0] if expanded_cloud_cover else None,
            daytime=current_period.get("isDaytime"),
            uv_index=current_uv_index,
            weather_condition_text=current_period.get("shortForecast"),
            precipitation_inches=current_precipitation_inches,
        )
        current = {
            "label": requested_label or point["properties"]["relativeLocation"]["properties"]["city"],
            "condition": _condition_from_forecast(
                current_period.get("shortForecast") or "Cloudy",
                current_period.get("isDaytime"),
            ),
            "short_forecast": current_period.get("shortForecast") or "Unknown",
            "temperature_f": current_period.get("temperature"),
            "humidity_percent": current_humidity,
            "wind_speed_mph": current_wind_speed,
            "cloud_cover_percent": expanded_cloud_cover[0] if expanded_cloud_cover else None,
            "daytime": current_period.get("isDaytime"),
            "uv_index": current_uv_index,
            "precipitation_inches": current_precipitation_inches,
            "rain_probability": current_rain_probability,
            "feels_like_basic_f": round_value(current_feels_like["feels_like_basic"], 1),
            "feels_like_enhanced_f": round_value(current_feels_like["feels_like_enhanced"], 1),
            "feels_like_shade_f": round_value(current_feels_like["feels_like_shade"], 1),
            "apparent_temperature_f": round_value(current_feels_like["feels_like_enhanced"], 1),
            "wind_direction": current_period.get("windDirection"),
            "dew_point_f": round_value(
                celsius_to_fahrenheit(
                    ((current_period.get("dewpoint", {}) or {}).get("value"))
                ),
                1,
            ),
        }

        if minute_nowcast is None:
            nws_nowcast_series = _build_nws_observation_nowcast_series(
                nws_observation,
                hours,
                now,
            )
            if nws_nowcast_series:
                minute_nowcast = {"series": nws_nowcast_series}
                minute_nowcast_source = "nws-observation-blend"
            else:
                if "minute_nowcast_nws_observation_unavailable" not in degraded_sources:
                    degraded_sources.append("minute_nowcast_nws_observation_unavailable")

        spc_hail_outlook = _spc_hail_outlook_peak(severe_matches)
        horizons: dict[str, dict[str, Any]] = {}
        for hours_value in (1, 4, 12, 24, 48):
            horizon = self._build_horizon(
                hours,
                hours_value,
                current=current,
                minute_nowcast=minute_nowcast,
                snapshot_time=now,
            )
            horizon_items = hours[:hours_value]
            hail_signal = _build_hail_signal(horizon_items, spc_hail_outlook)
            horizon["hail_signal"] = hail_signal
            if isinstance(horizon.get("maxima"), dict):
                horizon["maxima"]["hail"] = 0.0
            hail_summary = _hail_signal_summary_text(hail_signal)
            if hail_summary and isinstance(horizon.get("summary"), str):
                base_summary = horizon["summary"]
                if hail_summary not in base_summary:
                    horizon["summary"] = f"{base_summary}; {hail_summary}"
            horizons[str(hours_value)] = horizon
        nowcast_source = (
            minute_nowcast_source
            if horizons.get("1", {}).get("supports_minute_nowcast")
            else "forecast-only"
        )

        source_status = {
            "generated_at": _iso(now),
            "timezone": local_timezone,
            "latitude": point["geometry"]["coordinates"][1],
            "longitude": point["geometry"]["coordinates"][0],
            "forecast_office": point["properties"]["gridId"],
            "forecast_grid_url": point["properties"]["forecastGridData"],
            "forecast_hourly_url": point["properties"]["forecastHourly"],
            "alerts_url": NWS_ALERTS_URL.format(
                lat=point["geometry"]["coordinates"][1],
                lon=point["geometry"]["coordinates"][0],
            ),
            "uv_source": uv_source,
            "rain_probability_source": rain_probability_source,
            "rain_amount_source": rain_amount_source,
            "minute_nowcast_source": nowcast_source,
            "hail_source": "nws-grid-large_hail",
            "spc_hail_outlook_percent": _spc_hail_outlook_peak(severe_matches),
            "spc_days_loaded": [1, 2],
            "wind_threshold_mph": wind_threshold_mph,
            "degraded_sources": degraded_sources,
        }

        return {
            "current": current,
            "hourly": hours,
            "hourly_forecast": self._build_weather_forecast(hours),
            "daily_forecast": self._build_daily_forecast(hours),
            "horizons": horizons,
            "alerts": alerts_payload,
            "source_status": source_status,
        }

    def _build_severe_hourly(
        self,
        timeline: list[datetime],
        severe_matches: dict[str, list[Any]],
    ) -> list[dict[str, float]]:
        output: list[dict[str, float]] = []
        for bucket_start in timeline:
            bucket = {
                "hail_probability": 0.0,
                "tornado_probability": 0.0,
                "severe_wind_probability": 0.0,
                "storm_probability": 0.0,
            }
            for match in severe_matches.get("torn", []):
                if match.valid_start <= bucket_start < match.valid_end:
                    bucket["tornado_probability"] = max(
                        bucket["tornado_probability"],
                        match.probability_percent,
                    )
                    bucket["storm_probability"] = max(
                        bucket["storm_probability"],
                        match.probability_percent,
                    )
            for match in severe_matches.get("wind", []):
                if match.valid_start <= bucket_start < match.valid_end:
                    bucket["severe_wind_probability"] = max(
                        bucket["severe_wind_probability"],
                        match.probability_percent,
                    )
                    bucket["storm_probability"] = max(
                        bucket["storm_probability"],
                        match.probability_percent,
                    )
            output.append(bucket)
        return output

    def _build_weather_forecast(self, hours: list[dict[str, Any]]) -> list[dict[str, Any]]:
        forecast: list[dict[str, Any]] = []
        for hour in hours:
            forecast.append(
                {
                    "datetime": hour["start"],
                    "condition": hour["condition"],
                    "temperature": hour["temperature_f"],
                    "precipitation_probability": round_value(hour["rain_probability"], 1),
                    "native_temperature": hour["temperature_f"],
                }
            )
        return forecast

    def _build_daily_forecast(self, hours: list[dict[str, Any]]) -> list[dict[str, Any]]:
        by_day: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for hour in hours:
            day = hour["start"][:10]
            by_day[day].append(hour)

        forecast: list[dict[str, Any]] = []
        for day, items in list(by_day.items())[:3]:
            forecast.append(
                {
                    "datetime": f"{day}T00:00:00+00:00",
                    "condition": _condition_from_hour(
                        max(items, key=lambda item: item["storm_probability"] + item["rain_probability"])
                    ),
                    "temperature": max(
                        item["temperature_f"] for item in items if item["temperature_f"] is not None
                    ),
                    "templow": min(
                        item["temperature_f"] for item in items if item["temperature_f"] is not None
                    ),
                    "precipitation_probability": max(item["rain_probability"] for item in items),
                }
            )
        return forecast

    def _build_alerts_payload(self, alerts: dict[str, Any]) -> list[dict[str, Any]]:
        payload: list[dict[str, Any]] = []
        for feature in alerts.get("features", []):
            properties = feature.get("properties", {})
            payload.append(
                {
                    "event": properties.get("event"),
                    "headline": properties.get("headline"),
                    "severity": (properties.get("severity") or "unknown").lower(),
                    "certainty": properties.get("certainty"),
                    "urgency": properties.get("urgency"),
                    "start": properties.get("onset") or properties.get("effective"),
                    "end": properties.get("ends") or properties.get("expires"),
                }
            )
        return payload

    def _build_horizon_1h(
        self,
        hours: list[dict[str, Any]],
        current: dict[str, Any] | None = None,
        minute_nowcast: dict[str, Any] | None = None,
        snapshot_time: datetime | None = None,
    ) -> dict[str, Any]:
        now = ensure_utc(snapshot_time or datetime.now(UTC))
        first_hour = hours[:1]
        if not first_hour:
            return {
                "range_hours": 1,
                "bin_minutes": 1,
                "model_kind": "observed_nowcast_1h",
                "source_kind": "forecast-only",
                "supports_minute_nowcast": False,
                "nowcast_status": "source_unavailable",
                "nowcast_reason": "hourly forecast unavailable",
                "precip_now_known": False,
                "precip_now": False,
                "precip_type_now": "none",
                "precip_intensity_now": "none",
                "precip_rate_now": None,
                "precip_rate_unit": None,
                "next_precip_start_minutes": None,
                "next_precip_stop_minutes": None,
                "next_precip_type": None,
                "next_precip_intensity_peak": None,
                "minute_series": [],
                "series": [],
                "maxima": {
                    "rain": 0.0,
                    "storm": 0.0,
                    "strong_wind": 0.0,
                    "hail": 0.0,
                    "tornado": 0.0,
                    "temperature_min": 0.0,
                    "temperature_max": 0.0,
                },
                "summary": "Minute nowcast unavailable for this location; forecast-only next hour",
            }

        item = first_hour[0]
        temperature = item.get("temperature_f")
        apparent_temperature = item.get("apparent_temperature_f")
        condition = item.get("condition")
        start = item.get("start")
        end = item.get("end")

        series: list[dict[str, Any]] = [
            {
                "key": "temperature",
                "label": HAZARD_LABELS["temperature"],
                "unit": HAZARD_UNITS["temperature"],
                "points": [
                    {
                        "start": start,
                        "end": end,
                        "value": round_value(float(temperature), 1) if temperature is not None else 0.0,
                        "apparent_value": (
                            round_value(float(apparent_temperature), 1)
                            if apparent_temperature is not None
                            else None
                        ),
                        "condition": condition,
                    }
                ],
            }
        ]

        maxima = {
            "rain": round_value(float(item.get("rain_probability", 0.0)), 1),
            "storm": round_value(float(item.get("storm_probability", 0.0)), 1),
            "strong_wind": round_value(float(item.get("strong_wind_probability", 0.0)), 1),
            "hail": round_value(float(item.get("hail_probability", 0.0)), 1),
            "tornado": round_value(float(item.get("tornado_probability", 0.0)), 1),
            "temperature_min": round_value(float(temperature), 1) if temperature is not None else 0.0,
            "temperature_max": round_value(float(temperature), 1) if temperature is not None else 0.0,
        }

        current_condition = (current or {}).get("condition")
        current_rain_probability = float(item.get("rain_probability", 0.0))
        current_storm_probability = float(item.get("storm_probability", 0.0))
        inferred_type = "storm" if current_storm_probability > 0 else "rain" if current_rain_probability > 0 else "none"

        minute_series = _normalize_direct_minute_series(minute_nowcast)
        if not minute_series:
            nowcast_buckets = _select_nowcast_buckets_for_horizon(
                _normalize_minutely_buckets(minute_nowcast),
                now,
            )
            minute_series = _expand_nowcast_minute_series(nowcast_buckets, hours)
        supports_nowcast = len(minute_series) > 0

        if supports_nowcast:
            current_point: dict[str, Any] | None = None
            for point in minute_series:
                point_start = _parse_open_meteo_time(point.get("start"))
                point_end = _parse_open_meteo_time(point.get("end"))
                if point_start is None or point_end is None:
                    continue
                if point_start <= now < point_end:
                    current_point = point
                    break
            if current_point is None:
                current_point = minute_series[0]

            precip_now = _nowcast_activity(current_point)
            precip_now_type = str(current_point.get("precip_type") or "none")
            precip_now_intensity = str(current_point.get("precip_intensity") or "none")
            precip_now_rate = _to_float(current_point.get("precip_rate"), 0.0)
            if not precip_now:
                precip_now_type = "none"
                precip_now_intensity = "none"
                precip_now_rate = 0.0

            (
                next_precip_start_minutes,
                next_precip_stop_minutes,
                next_precip_type,
                next_precip_intensity_peak,
            ) = _compute_nowcast_timing(minute_series, now)
            if next_precip_type == "none":
                next_precip_type = None
            if next_precip_intensity_peak == "none":
                next_precip_intensity_peak = None

            nowcast_rain_peak = round_value(
                max(_to_float(point.get("precip_probability"), 0.0) for point in minute_series),
                1,
            )
            nowcast_storm_peak = round_value(
                max(_to_float(point.get("storm_probability"), 0.0) for point in minute_series),
                1,
            )

            maxima["rain"] = nowcast_rain_peak
            maxima["storm"] = nowcast_storm_peak
            hail_max, tornado_max = _resolve_nowcast_hail_tornado_maxima()
            maxima["hail"] = hail_max
            maxima["tornado"] = tornado_max

            if precip_now:
                summary = (
                    f"{_precip_type_label(precip_now_type)} now; "
                    f"peak chance next hour {nowcast_rain_peak:.0f}%"
                )
            elif next_precip_start_minutes is not None and next_precip_type:
                summary = (
                    f"Dry now; {_precip_type_label(next_precip_type).lower()} "
                    f"possible in {next_precip_start_minutes} min"
                )
            elif nowcast_rain_peak and nowcast_rain_peak > 0:
                summary = f"Peak chance next hour {nowcast_rain_peak:.0f}%"
            else:
                summary = "Minute nowcast active; no precipitation expected in next hour"

            return {
                "range_hours": 1,
                "bin_minutes": 1,
                "model_kind": "observed_nowcast_1h",
                "source_kind": "observed+nowcast",
                "supports_minute_nowcast": True,
                "nowcast_status": "ok",
                "nowcast_reason": None,
                "precip_now_known": True,
                "precip_now": precip_now,
                "precip_type_now": precip_now_type,
                "precip_intensity_now": precip_now_intensity,
                "precip_rate_now": round_value(precip_now_rate, 3),
                "precip_rate_unit": "in/h",
                "next_precip_start_minutes": next_precip_start_minutes,
                "next_precip_stop_minutes": next_precip_stop_minutes,
                "next_precip_type": next_precip_type,
                "next_precip_intensity_peak": next_precip_intensity_peak,
                "minute_series": minute_series,
                "series": series,
                "maxima": maxima,
                "summary": summary,
            }

        return {
            "range_hours": 1,
            "bin_minutes": 1,
            "model_kind": "observed_nowcast_1h",
            "source_kind": "forecast-only",
            "supports_minute_nowcast": False,
            "nowcast_status": "unsupported_location",
            "nowcast_reason": "minute nowcast source unavailable",
            "precip_now_known": False,
            "precip_now": False,
            "precip_type_now": "none",
            "precip_intensity_now": "none",
            "precip_rate_now": None,
            "precip_rate_unit": None,
            "next_precip_start_minutes": None,
            "next_precip_stop_minutes": None,
            "next_precip_type": inferred_type if inferred_type != "none" else None,
            "next_precip_intensity_peak": None,
            "minute_series": [],
            "series": series,
            "maxima": maxima,
            "summary": (
                "Minute nowcast unavailable for this location; "
                f"forecast-only next hour ({current_condition or 'unknown conditions'})"
            ),
        }

    def _build_horizon(
        self,
        hours: list[dict[str, Any]],
        horizon_hours: int,
        current: dict[str, Any] | None = None,
        minute_nowcast: dict[str, Any] | None = None,
        snapshot_time: datetime | None = None,
    ) -> dict[str, Any]:
        if horizon_hours == 1:
            return self._build_horizon_1h(
                hours,
                current=current,
                minute_nowcast=minute_nowcast,
                snapshot_time=snapshot_time,
            )

        bin_hours = HORIZON_BINS[horizon_hours]
        horizon_items = hours[:horizon_hours]
        bins: list[list[dict[str, Any]]] = [
            horizon_items[index : index + bin_hours]
            for index in range(0, len(horizon_items), bin_hours)
        ]
        series: list[dict[str, Any]] = []
        for key in ("temperature", "rain", "storm", "strong_wind", "tornado"):
            points: list[dict[str, Any]] = []
            for items in bins:
                start = items[0]["start"]
                end = items[-1]["end"]
                if key == "temperature":
                    value = average_or_zero(
                        item["temperature_f"] for item in items if item["temperature_f"] is not None
                    )
                    apparent_values = [
                        item["apparent_temperature_f"]
                        for item in items
                        if item.get("apparent_temperature_f") is not None
                    ]
                elif key == "rain":
                    value = max_or_zero(item["rain_probability"] for item in items)
                elif key == "storm":
                    value = max_or_zero(item["storm_probability"] for item in items)
                elif key == "strong_wind":
                    value = max_or_zero(item["strong_wind_probability"] for item in items)
                else:
                    value = max_or_zero(item["tornado_probability"] for item in items)
                point = {
                    "start": start,
                    "end": end,
                    "value": round_value(float(value), 1),
                }
                if key == "temperature" and apparent_values:
                    point["apparent_value"] = round_value(average_or_zero(apparent_values), 1)
                if key == "temperature":
                    point["condition"] = _representative_condition(items)
                points.append(point)
            series.append(
                {
                    "key": key,
                    "label": HAZARD_LABELS[key],
                    "unit": HAZARD_UNITS[key],
                    "points": points,
                }
            )

        maxima = {
            "rain": round_value(max_or_zero(item["rain_probability"] for item in horizon_items), 1),
            "storm": round_value(max_or_zero(item["storm_probability"] for item in horizon_items), 1),
            "strong_wind": round_value(
                max_or_zero(item["strong_wind_probability"] for item in horizon_items),
                1,
            ),
            "hail": 0.0,
            "tornado": round_value(
                max_or_zero(item["tornado_probability"] for item in horizon_items),
                1,
            ),
            "temperature_min": round_value(
                min(item["temperature_f"] for item in horizon_items if item["temperature_f"] is not None),
                1,
            ),
            "temperature_max": round_value(
                max(item["temperature_f"] for item in horizon_items if item["temperature_f"] is not None),
                1,
            ),
        }

        hazard_bits = []
        for key in ("rain", "storm", "strong_wind", "tornado"):
            value = maxima[key]
            if not is_zeroish(value):
                hazard_bits.append(f"{HAZARD_LABELS[key]} {value:.0f}%")
        if hazard_bits:
            summary = ", ".join(hazard_bits)
        else:
            summary = (
                "No disruptive weather risk; "
                f"temperature {maxima['temperature_min']:.0f}-{maxima['temperature_max']:.0f} F"
            )

        return {
            "range_hours": horizon_hours,
            "bin_minutes": bin_hours * 60,
            "series": series,
            "maxima": maxima,
            "summary": summary,
        }
