# Weather Risk Bridge App

Companion NOAA/SPC API used by the **Weather Risk Bridge** Home Assistant integration.

## What it does

Exposes:

- `GET /healthz`
- `GET /v1/snapshot?lat=…&lon=…&label=…&wind_threshold_mph=…`

Home Assistant Core reaches this app on the Supervisor network. The integration usually discovers and pre-fills something like:

```text
http://172.30.33.6:8099
```

Keep that discovered `172.30.x.x` address — it is the correct same-host URL. The hostname `http://weather-risk-bridge:8099` often does not resolve on Supervisor DNS. If discovery is empty, use `http://HOME_ASSISTANT_HOST_IP:8099`.

## Install and verify (do not skip)

1. **Settings → Apps → App store → ⋮ → Repositories** → add `https://github.com/pHarmG/weather-risk-bridge`.
2. Open **Weather Risk Bridge** → **Install** (first build can take several minutes).
3. Enable **Start on boot** (and optionally **Watchdog**).
4. Optional **Configuration**: set `token` only if you want bearer auth; leave `port` at `8099` unless you have a conflict.
5. **Start** the app.
6. Open **Log** and confirm it stays running without a traceback (listening on `8099`).
7. Optional: `curl http://HOME_ASSISTANT_HOST_IP:8099/healthz` from your LAN.

If you prefer the API on a **different computer** than Home Assistant, skip this app and use the repository README’s **Docker alternative** instead, then point the integration Service URL at `http://THAT_HOST_LAN_IP:8099`.

## After the app is healthy — configure location in Home Assistant

The app does **not** store your home coordinates. Enter them in the integration:

1. Install **Weather Risk Bridge** via HACS (same GitHub repository) and restart Home Assistant.
2. **Settings → Devices & Services → Add Integration → Weather Risk Bridge**.
3. Service URL: leave the auto-filled `http://172.30.x.x:8099` value (or use `http://HOME_ASSISTANT_HOST_IP:8099` if blank).
4. Set **Label**, **Latitude**, and **Longitude** (decimal degrees; US west longitudes are negative). Copy from **Settings → System → General**, Google Maps (right-click), or a lat/lon lookup site.
5. Add the Lovelace card with `location:` matching your label slug (for example `home`).

Full walkthrough: [README.md](https://github.com/pHarmG/weather-risk-bridge/blob/main/README.md).

## Options

| Option | Description |
|--------|-------------|
| `port` | HTTP listen port (default `8099`, mapped to the host) |
| `token` | Optional bearer token required by `/v1/snapshot` |
| `user_agent` | NWS User-Agent identification string |

## Notes

- Data sources are US-focused (NWS + SPC). Non-US coordinates are not supported.
- Apple WeatherKit minute nowcast is optional and not configured via this app's UI; use Docker/env if you need it.
