from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass(frozen=True)
class SevereLayerMatch:
    hazard: str
    probability_percent: float
    label: str
    valid_start: datetime
    valid_end: datetime
    issue_time: datetime | None
    forecaster: str | None


JsonDict = dict[str, Any]
