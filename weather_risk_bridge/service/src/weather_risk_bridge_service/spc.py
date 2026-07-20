from __future__ import annotations

import io
import re
import zipfile
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable

import shapefile

from .cache import HttpDocumentCache
from .models import SevereLayerMatch


SPC_BASE_URL = "https://www.spc.noaa.gov/products/outlook"


@dataclass(frozen=True)
class SpcPolygon:
    probability_percent: float
    label: str
    valid_start: datetime
    valid_end: datetime
    issue_time: datetime | None
    forecaster: str | None
    rings: list[list[tuple[float, float]]]


def _ring_contains(point_lon: float, point_lat: float, ring: list[tuple[float, float]]) -> bool:
    inside = False
    count = len(ring)
    if count < 3:
        return False
    previous_x, previous_y = ring[-1]
    for current_x, current_y in ring:
        intersects = ((current_y > point_lat) != (previous_y > point_lat)) and (
            point_lon
            < (previous_x - current_x) * (point_lat - current_y) / ((previous_y - current_y) or 1e-12)
            + current_x
        )
        if intersects:
            inside = not inside
        previous_x, previous_y = current_x, current_y
    return inside


def _shape_rings(shape: shapefile.Shape) -> list[list[tuple[float, float]]]:
    points = shape.points
    parts = list(shape.parts) + [len(points)]
    rings: list[list[tuple[float, float]]] = []
    for start, end in zip(parts, parts[1:]):
        rings.append([(float(lon), float(lat)) for lon, lat in points[start:end]])
    return rings


def _geometry_contains(point_lon: float, point_lat: float, rings: list[list[tuple[float, float]]]) -> bool:
    inside = False
    for ring in rings:
        if _ring_contains(point_lon, point_lat, ring):
            inside = not inside
    return inside


def _record_probability(record: dict[str, object]) -> float:
    label = str(record.get("LABEL", "")).strip()
    if not label or label.startswith("Less Than"):
        return 0.0
    if re.fullmatch(r"0\.\d+", label):
        return float(label) * 100.0
    return 0.0


def _pick_layer_names(zip_names: Iterable[str], hazard: str) -> tuple[str, str, str] | None:
    names = list(zip_names)
    for name in names:
        if name.endswith(f"_{hazard}.shp") and ".lyr." not in name and ".nolyr." not in name:
            stem = name[:-4]
            if f"{stem}.dbf" in names and f"{stem}.shx" in names:
                return f"{stem}.shp", f"{stem}.shx", f"{stem}.dbf"
    return None


class SpcClient:
    def __init__(self, cache: HttpDocumentCache, cache_ttl_seconds: int):
        self._cache = cache
        self._cache_ttl_seconds = cache_ttl_seconds

    async def get_hazard_match(
        self,
        client,
        day: int,
        hazard: str,
        lon: float,
        lat: float,
    ) -> SevereLayerMatch | None:
        archive_url = await self._discover_archive_zip(client, day)
        if not archive_url:
            return None
        zip_bytes = await self._cache.get_bytes(client, archive_url, self._cache_ttl_seconds)
        polygons = self._load_polygons(zip_bytes, hazard)
        matches = [
            polygon
            for polygon in polygons
            if polygon.probability_percent > 0
            and _geometry_contains(lon, lat, polygon.rings)
        ]
        if not matches:
            return None
        winner = max(matches, key=lambda item: item.probability_percent)
        return SevereLayerMatch(
            hazard=hazard,
            probability_percent=winner.probability_percent,
            label=winner.label,
            valid_start=winner.valid_start,
            valid_end=winner.valid_end,
            issue_time=winner.issue_time,
            forecaster=winner.forecaster,
        )

    async def _discover_archive_zip(self, client, day: int) -> str | None:
        page_url = f"{SPC_BASE_URL}/day{day}otlk.html"
        html = await self._cache.get_text(client, page_url, self._cache_ttl_seconds)
        match = re.search(
            rf'href="(?P<href>[^"]*day{day}otlk_[0-9]{{8}}_[0-9]{{4}}-shp\.zip)"',
            html,
            flags=re.IGNORECASE,
        )
        if not match:
            return None
        href = match.group("href")
        if href.startswith("http"):
            return href
        return f"{SPC_BASE_URL}/{href.lstrip('./')}"

    def _load_polygons(self, zip_bytes: bytes, hazard: str) -> list[SpcPolygon]:
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as bundle:
            names = bundle.namelist()
            layer_names = _pick_layer_names(names, hazard)
            if not layer_names:
                return []
            shp_name, shx_name, dbf_name = layer_names
            reader = shapefile.Reader(
                shp=io.BytesIO(bundle.read(shp_name)),
                shx=io.BytesIO(bundle.read(shx_name)),
                dbf=io.BytesIO(bundle.read(dbf_name)),
            )
            polygons: list[SpcPolygon] = []
            for shape_record in reader.iterShapeRecords():
                record = shape_record.record.as_dict()
                probability_percent = _record_probability(record)
                if probability_percent <= 0:
                    continue
                polygons.append(
                    SpcPolygon(
                        probability_percent=probability_percent,
                        label=str(record.get("LABEL2") or record.get("LABEL") or "").strip(),
                        valid_start=datetime.fromisoformat(str(record["VALID_ISO"])),
                        valid_end=datetime.fromisoformat(str(record["EXPIRE_ISO"])),
                        issue_time=datetime.fromisoformat(str(record["ISSUE_ISO"]))
                        if record.get("ISSUE_ISO")
                        else None,
                        forecaster=str(record.get("FORECASTER") or "").strip() or None,
                        rings=_shape_rings(shape_record.shape),
                    )
                )
            return polygons
