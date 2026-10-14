"""Tests for the SPC-shaped hourly hail estimate."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from pathlib import Path
from types import SimpleNamespace
import sys
import unittest

ROOT = Path(__file__).parents[1]
SERVICE_SRC = ROOT / "weather_risk_bridge" / "service" / "src"

if str(SERVICE_SRC) not in sys.path:
    sys.path.insert(0, str(SERVICE_SRC))

from weather_risk_bridge_service.snapshot import _apply_spc_hail_estimates  # noqa: E402

BASE = datetime(2026, 10, 13, 12, tzinfo=UTC)


def _hours(storm_values: list[float]) -> list[dict]:
    return [
        {"start": (BASE + timedelta(hours=i)).isoformat(), "storm_probability": value}
        for i, value in enumerate(storm_values)
    ]


def _match(percent: float, start_hour: int, end_hour: int) -> SimpleNamespace:
    return SimpleNamespace(
        probability_percent=percent,
        valid_start=BASE + timedelta(hours=start_hour),
        valid_end=BASE + timedelta(hours=end_hour),
    )


class HailEstimateTests(unittest.TestCase):
    def test_peak_storm_hour_gets_full_spc_value(self) -> None:
        hours = _hours([10.0, 40.0, 20.0, 0.0])
        _apply_spc_hail_estimates(hours, [_match(15.0, 0, 4)])
        self.assertEqual([h["hail_estimate_probability"] for h in hours], [3.8, 15.0, 7.5, 0.0])

    def test_hours_outside_window_stay_zero(self) -> None:
        hours = _hours([50.0, 50.0, 50.0])
        _apply_spc_hail_estimates(hours, [_match(30.0, 1, 2)])
        self.assertEqual([h["hail_estimate_probability"] for h in hours], [0.0, 30.0, 0.0])

    def test_no_storm_signal_means_no_estimate(self) -> None:
        hours = _hours([0.0, 0.0])
        _apply_spc_hail_estimates(hours, [_match(15.0, 0, 2)])
        self.assertEqual([h["hail_estimate_probability"] for h in hours], [0.0, 0.0])

    def test_no_outlook_means_zero(self) -> None:
        hours = _hours([60.0])
        _apply_spc_hail_estimates(hours, [])
        self.assertEqual(hours[0]["hail_estimate_probability"], 0.0)

    def test_overlapping_days_take_the_higher_estimate(self) -> None:
        hours = _hours([20.0, 40.0])
        _apply_spc_hail_estimates(hours, [_match(5.0, 0, 2), _match(30.0, 1, 2)])
        self.assertEqual([h["hail_estimate_probability"] for h in hours], [2.5, 30.0])


if __name__ == "__main__":
    unittest.main()
