# Weather Risk Bridge Add-on

Companion NOAA/SPC API used by the **Weather Risk Bridge** Home Assistant integration.

## What it does

Exposes:

- `GET /healthz`
- `GET /v1/snapshot?lat=…&lon=…&label=…&wind_threshold_mph=…`

Home Assistant Core reaches this add-on at:

```text
http://weather-risk-bridge:8099
```

That hostname matches the add-on `hostname` and is the default service URL in the integration config flow.

## Options

| Option | Description |
|--------|-------------|
| `port` | HTTP listen port (default `8099`, mapped to the host) |
| `token` | Optional bearer token required by `/v1/snapshot` |
| `user_agent` | NWS User-Agent identification string |

## After install

1. Start the add-on and confirm logs show the service listening.
2. Install the **Weather Risk Bridge** integration via HACS (same GitHub repository).
3. Add the integration in **Settings → Devices & Services** and keep the default service URL when using this add-on.
4. Add the **Weather Risk Bridge** Lovelace card (auto-registered in storage mode).

## Notes

- Data sources are US-focused (NWS + SPC). Non-US coordinates are not supported.
- Apple WeatherKit minute nowcast is optional and not configured via this add-on's UI; use Docker/env if you need it.
