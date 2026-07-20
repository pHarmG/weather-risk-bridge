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

## After install — configure your location in Home Assistant

The add-on itself does **not** store your home coordinates. You enter latitude/longitude when you add the **Weather Risk Bridge** integration:

1. Start this add-on and confirm logs show the service listening.
2. Install the **Weather Risk Bridge** integration via HACS (same GitHub repository) and restart Home Assistant.
3. **Settings → Devices & Services → Add Integration → Weather Risk Bridge**.
4. Keep the default service URL when using this add-on.
5. Set **Label** (for example `Home`), **Latitude**, and **Longitude** for the place you want tracked (decimal degrees; US west longitudes are negative). You can copy coordinates from **Settings → System → General**, Google Maps (right-click), or a lat/lon lookup site.
6. Add the **Weather Risk Bridge** Lovelace card and bind it with `location: home` (or whatever slug matches your label).

Full walkthrough: repository [README.md](https://github.com/pHarmG/weather-risk-bridge/blob/main/README.md).

## Notes

- Data sources are US-focused (NWS + SPC). Non-US coordinates are not supported.
- Apple WeatherKit minute nowcast is optional and not configured via this add-on's UI; use Docker/env if you need it.
