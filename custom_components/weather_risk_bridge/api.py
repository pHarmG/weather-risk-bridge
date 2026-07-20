from __future__ import annotations

import logging
from typing import Any

from aiohttp import ClientResponseError, ClientSession

LOGGER = logging.getLogger(__name__)


class WeatherRiskBridgeClient:
    def __init__(
        self,
        session: ClientSession,
        service_url: str,
        bearer_token: str | None,
    ) -> None:
        self._session = session
        self._service_url = service_url.rstrip("/")
        self._bearer_token = bearer_token

    async def async_healthcheck(self) -> dict[str, Any]:
        return await self._request_json("/healthz")

    async def async_snapshot(
        self,
        *,
        latitude: float,
        longitude: float,
        label: str | None,
        wind_threshold_mph: int,
    ) -> dict[str, Any]:
        params = {
            "lat": latitude,
            "lon": longitude,
            "wind_threshold_mph": wind_threshold_mph,
        }
        if label:
            params["label"] = label
        return await self._request_json("/v1/snapshot", params=params)

    async def _request_json(
        self,
        path: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        LOGGER.debug("Requesting Weather Risk Bridge path=%s params=%s", path, params)
        headers = {}
        if self._bearer_token:
            headers["Authorization"] = f"Bearer {self._bearer_token}"
        async with self._session.get(
            f"{self._service_url}{path}",
            params=params,
            headers=headers,
        ) as response:
            if response.status >= 400:
                message = await response.text()
                LOGGER.warning(
                    "Weather Risk Bridge request failed path=%s status=%s",
                    path,
                    response.status,
                )
                raise ClientResponseError(
                    response.request_info,
                    response.history,
                    status=response.status,
                    message=message,
                    headers=response.headers,
                )
            payload = await response.json()
            LOGGER.debug("Weather Risk Bridge response received path=%s", path)
            return payload
