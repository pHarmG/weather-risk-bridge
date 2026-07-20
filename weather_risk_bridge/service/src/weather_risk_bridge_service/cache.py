from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

import httpx


@dataclass
class HttpCacheEntry:
    expires_at: float
    payload: Any
    etag: str | None = None
    last_modified: str | None = None


class HttpDocumentCache:
    def __init__(self) -> None:
        self._entries: dict[str, HttpCacheEntry] = {}

    async def get_json(
        self,
        client: httpx.AsyncClient,
        url: str,
        ttl_seconds: int,
    ) -> Any:
        return await self._request(client, url, ttl_seconds, expect_json=True)

    async def get_text(
        self,
        client: httpx.AsyncClient,
        url: str,
        ttl_seconds: int,
    ) -> str:
        return await self._request(client, url, ttl_seconds, expect_json=False)

    async def get_bytes(
        self,
        client: httpx.AsyncClient,
        url: str,
        ttl_seconds: int,
    ) -> bytes:
        cached = self._entries.get(url)
        headers: dict[str, str] = {}
        now = time.monotonic()
        if cached and cached.expires_at > now:
            return cached.payload
        if cached and cached.etag:
            headers["If-None-Match"] = cached.etag
        if cached and cached.last_modified:
            headers["If-Modified-Since"] = cached.last_modified

        try:
            response = await client.get(url, headers=headers)
        except httpx.HTTPError:
            if cached:
                cached.expires_at = now + min(ttl_seconds, 60)
                return cached.payload
            raise
        if response.status_code == 304 and cached:
            cached.expires_at = now + ttl_seconds
            return cached.payload

        try:
            response.raise_for_status()
        except httpx.HTTPError:
            if cached:
                cached.expires_at = now + min(ttl_seconds, 60)
                return cached.payload
            raise
        payload = response.content
        self._entries[url] = HttpCacheEntry(
            expires_at=now + ttl_seconds,
            payload=payload,
            etag=response.headers.get("ETag"),
            last_modified=response.headers.get("Last-Modified"),
        )
        return payload

    async def _request(
        self,
        client: httpx.AsyncClient,
        url: str,
        ttl_seconds: int,
        expect_json: bool,
    ) -> Any:
        cached = self._entries.get(url)
        headers: dict[str, str] = {}
        now = time.monotonic()
        if cached and cached.expires_at > now:
            return cached.payload
        if cached and cached.etag:
            headers["If-None-Match"] = cached.etag
        if cached and cached.last_modified:
            headers["If-Modified-Since"] = cached.last_modified

        try:
            response = await client.get(url, headers=headers)
        except httpx.HTTPError:
            if cached:
                cached.expires_at = now + min(ttl_seconds, 60)
                return cached.payload
            raise
        if response.status_code == 304 and cached:
            cached.expires_at = now + ttl_seconds
            return cached.payload

        try:
            response.raise_for_status()
        except httpx.HTTPError:
            if cached:
                cached.expires_at = now + min(ttl_seconds, 60)
                return cached.payload
            raise
        payload = response.json() if expect_json else response.text
        self._entries[url] = HttpCacheEntry(
            expires_at=now + ttl_seconds,
            payload=payload,
            etag=response.headers.get("ETag"),
            last_modified=response.headers.get("Last-Modified"),
        )
        return payload


class SnapshotRouteCache:
    def __init__(self) -> None:
        self._entries: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        entry = self._entries.get(key)
        if not entry:
            return None
        expires_at, payload = entry
        if expires_at <= time.monotonic():
            self._entries.pop(key, None)
            return None
        return payload

    def put(self, key: str, ttl_seconds: int, payload: Any) -> None:
        self._entries[key] = (time.monotonic() + ttl_seconds, payload)
