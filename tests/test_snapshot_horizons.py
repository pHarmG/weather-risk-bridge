"""Regression tests for the 120-hour (5-day) forecast horizon window."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).parents[1]
SERVICE_SRC = ROOT / "weather_risk_bridge" / "service" / "src"

if str(SERVICE_SRC) not in sys.path:
    sys.path.insert(0, str(SERVICE_SRC))

from weather_risk_bridge_service.snapshot import (  # noqa: E402
    DAILY_FORECAST_DAYS,
    HORIZON_BINS,
    HORIZONS,
    HOURLY_WINDOW_HOURS,
    SnapshotBuilder,
)


def _hour(index: int) -> dict:
    start = datetime(2026, 10, 13, 12, tzinfo=UTC) + timedelta(hours=index)
    return {
        "start": start.isoformat(),
        "end": (start + timedelta(hours=1)).isoformat(),
        "temperature_f": 60.0 + (index % 24),
        "apparent_temperature_f": 58.0 + (index % 24),
        "rain_probability": float(index % 40),
        "storm_probability": float(index % 10),
        "strong_wind_probability": float(index % 25),
        "hail_probability": 0.0,
        "tornado_probability": 0.0,
        "short_forecast": "Clear",
        "daytime": True,
    }


def _hours(count: int) -> list[dict]:
    return [_hour(index) for index in range(count)]


def _builder() -> SnapshotBuilder:
    return SnapshotBuilder(
        http_cache=None,
        spc_client=None,
        request_timeout_seconds=1,
        user_agent="test-agent",
        http_cache_ttl_seconds=1,
        weatherkit=None,
    )


class TestHorizonConstants(unittest.TestCase):
    def test_horizons_include_120_hours(self):
        self.assertEqual(HORIZONS, (1, 4, 12, 24, 48, 120))

    def test_120h_uses_6h_bins(self):
        self.assertEqual(HORIZON_BINS[120], 6)

    def test_hourly_window_and_daily_caps_widened(self):
        self.assertEqual(HOURLY_WINDOW_HOURS, 120)
        self.assertEqual(DAILY_FORECAST_DAYS, 5)


class TestHorizonBuilding(unittest.TestCase):
    def test_120h_horizon_bins_into_20_points(self):
        horizon = _builder()._build_horizon(_hours(120), 120)
        self.assertEqual(horizon["range_hours"], 120)
        self.assertEqual(horizon["bin_minutes"], 360)
        for series in horizon["series"]:
            self.assertEqual(len(series["points"]), 20)
        temperature = next(s for s in horizon["series"] if s["key"] == "temperature")
        self.assertEqual(temperature["points"][0]["start"], _hours(1)[0]["start"])
        self.assertEqual(temperature["points"][-1]["end"], _hours(120)[-1]["end"])
        self.assertIn("apparent_value", temperature["points"][0])
        self.assertTrue(horizon["summary"])

    def test_every_strategic_horizon_bins_cover_its_window(self):
        builder = _builder()
        hours = _hours(120)
        for horizon_hours in (4, 12, 24, 48, 120):
            horizon = builder._build_horizon(hours, horizon_hours)
            expected_points = horizon_hours // HORIZON_BINS[horizon_hours]
            for series in horizon["series"]:
                self.assertEqual(
                    len(series["points"]),
                    expected_points,
                    msg=f"horizon {horizon_hours}h series {series['key']}",
                )

    def test_horizon_rejects_unknown_window(self):
        with self.assertRaises(KeyError):
            _builder()._build_horizon(_hours(120), 72)


class TestDailyForecast(unittest.TestCase):
    def test_daily_forecast_caps_at_five_days(self):
        forecast = _builder()._build_daily_forecast(_hours(120))
        self.assertEqual(len(forecast), 5)
        expected_days = [f"2026-10-{day:02d}" for day in range(13, 18)]
        self.assertEqual([entry["datetime"][:10] for entry in forecast], expected_days)

    def test_daily_forecast_keeps_max_min_and_probability(self):
        forecast = _builder()._build_daily_forecast(_hours(120))
        first = forecast[0]
        first_items = _hours(12)
        self.assertEqual(first["temperature"], max(item["temperature_f"] for item in first_items))
        self.assertEqual(first["templow"], min(item["temperature_f"] for item in first_items))
        self.assertEqual(
            first["precipitation_probability"],
            max(item["rain_probability"] for item in first_items),
        )


if __name__ == "__main__":
    unittest.main()
