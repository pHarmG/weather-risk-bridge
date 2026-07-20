# Weather Risk Bridge Service

Stateless NOAA-backed companion service for the `weather_risk_bridge` Home Assistant integration.

## Endpoints

- `GET /healthz`
- `GET /v1/snapshot?lat=<float>&lon=<float>&label=<optional>&wind_threshold_mph=<30|40|50|60>`

## Environment

Default service URL for the Home Assistant integration (Home Assistant app) is `http://weather-risk-bridge:8099`.

- `WEATHER_RISK_BRIDGE_HOST` default `0.0.0.0`
- `WEATHER_RISK_BRIDGE_PORT` default `8099`
- `WEATHER_RISK_BRIDGE_TOKEN` optional bearer token for `/v1/snapshot`
- `WEATHER_RISK_BRIDGE_USER_AGENT` optional NWS user agent string
- `WEATHER_RISK_BRIDGE_REQUEST_TIMEOUT_SECONDS` default `20`
- `WEATHER_RISK_BRIDGE_ROUTE_CACHE_TTL_SECONDS` default `180`
- `WEATHER_RISK_BRIDGE_HTTP_CACHE_TTL_SECONDS` default `180`
- `WEATHER_RISK_BRIDGE_SPC_CACHE_TTL_SECONDS` default `1800`
- Minute nowcast defaults to a no-cost NWS observation + forecast blend (`source_status.minute_nowcast_source = nws-observation-blend`) when available
- Hourly hail bars use NWS grid `large_hail` + `probabilityOfThunder` (`source_status.hail_source = nws-grid-large_hail`); SPC hail outlook is exposed separately as `source_status.spc_hail_outlook_percent` for regional context only
- `WEATHER_RISK_BRIDGE_WEATHERKIT_TEAM_ID` Apple Developer Team ID (optional WeatherKit minute nowcast source)
- `WEATHER_RISK_BRIDGE_WEATHERKIT_SERVICE_ID` WeatherKit Service ID (optional WeatherKit minute nowcast source)
- `WEATHER_RISK_BRIDGE_WEATHERKIT_KEY_ID` WeatherKit Key ID (optional WeatherKit minute nowcast source)
- `WEATHER_RISK_BRIDGE_WEATHERKIT_PRIVATE_KEY` PEM contents for the `.p8` key (supports `\n` escapes)
- `WEATHER_RISK_BRIDGE_WEATHERKIT_PRIVATE_KEY_PATH` path to a `.p8` key file (used when `...PRIVATE_KEY` is unset)
- `WEATHER_RISK_BRIDGE_WEATHERKIT_LANGUAGE` request language path segment, default `en`
- `WEATHER_RISK_BRIDGE_WEATHERKIT_COUNTRY_CODE` optional WeatherKit country code (for example `US`)
- `WEATHER_RISK_BRIDGE_WEATHERKIT_FALLBACK_OPEN_METEO` default `false`; when `true`, Open-Meteo is used as an additional fallback when WeatherKit fails

## Home Assistant packaging

For HACS + Home Assistant app distribution, see [packaging/weather_risk_bridge/README.md](../../packaging/weather_risk_bridge/README.md) and run:

```powershell
.\scripts\packaging\weather_risk_bridge_export.ps1
```

## Run

```powershell
python -m pip install -e .[dev]
weather-risk-bridge
```
