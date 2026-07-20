from __future__ import annotations

from fastapi import Depends, FastAPI, Header, HTTPException, Query

from .cache import HttpDocumentCache, SnapshotRouteCache
from .settings import Settings
from .snapshot import SnapshotBuilder
from .spc import SpcClient


def create_app(settings: Settings) -> FastAPI:
    app = FastAPI(title="Weather Risk Bridge", version="0.1.0")
    http_cache = HttpDocumentCache()
    route_cache = SnapshotRouteCache()
    spc_client = SpcClient(http_cache, settings.spc_cache_ttl_seconds)
    snapshot_builder = SnapshotBuilder(
        http_cache=http_cache,
        spc_client=spc_client,
        request_timeout_seconds=settings.request_timeout_seconds,
        user_agent=settings.user_agent,
        http_cache_ttl_seconds=settings.http_cache_ttl_seconds,
        weatherkit=settings.weatherkit,
    )

    def _require_auth(authorization: str | None = Header(default=None)) -> None:
        if not settings.token:
            return
        if authorization != f"Bearer {settings.token}":
            raise HTTPException(status_code=401, detail="Unauthorized")

    @app.get("/healthz")
    async def healthz() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/v1/snapshot", dependencies=[Depends(_require_auth)])
    async def snapshot(
        lat: float = Query(..., ge=-90, le=90),
        lon: float = Query(..., ge=-180, le=180),
        label: str | None = Query(default=None, max_length=80),
        wind_threshold_mph: int = Query(default=40, ge=30, le=60),
    ) -> dict:
        if wind_threshold_mph not in {30, 40, 50, 60}:
            raise HTTPException(
                status_code=422,
                detail="wind_threshold_mph must be one of 30, 40, 50, or 60",
            )
        cache_key = f"{lat:.4f}:{lon:.4f}:{label or ''}:{wind_threshold_mph}"
        cached = route_cache.get(cache_key)
        if cached is not None:
            return cached
        payload = await snapshot_builder.build_snapshot(
            lat=lat,
            lon=lon,
            label=label,
            wind_threshold_mph=wind_threshold_mph,
        )
        route_cache.put(cache_key, settings.route_cache_ttl_seconds, payload)
        return payload

    return app
