# Weather Risk Bridge

US-focused weather risk dashboard for Home Assistant: companion service + config-flow integration + Lovelace card.

**Data coverage:** United States only (NWS + SPC). Non-US coordinates are not supported.

## Install (recommended)

### 1. Supervisor add-on (companion service)

1. In Home Assistant: **Settings → Add-ons → Add-on store → ⋮ → Repositories**
2. Add this repository URL: `https://github.com/pHarmG/weather-risk-bridge`
3. Install **Weather Risk Bridge**, start it, and confirm it is running
4. Optional: set a bearer `token` in add-on options

The service is reachable from Home Assistant Core at:

```text
http://weather-risk-bridge:8099
```

### 2. HACS integration (entities + card)

1. HACS → **Integrations** → ⋮ → **Custom repositories**
2. Repository: `https://github.com/pHarmG/weather-risk-bridge` · Category: **Integration**
3. Install **Weather Risk Bridge** and **restart Home Assistant**
4. **Settings → Devices & Services → Add Integration → Weather Risk Bridge**
5. Keep the default service URL when using the add-on; set latitude/longitude/label

The Lovelace card is served by the integration and auto-registered in **storage-mode** Lovelace. No manual `/www` copy is required.

### 3. Add the card

Dashboard → Add card → **Weather Risk Bridge**, or YAML:

```yaml
type: custom:weather-risk-bridge-card
location: home
title: Home Weather Risk
default_range: 12
```

The card editor can also create/update the integration location (label, coordinates, service URL, token).

#### YAML-mode Lovelace (footnote)

If Lovelace is in YAML mode, auto-registration is skipped. Add:

```yaml
resources:
  - url: /weather_risk_bridge/weather-risk-bridge-card.js
    type: module
```

## Docker alternative (no add-on)

Build and run from this repository's add-on service sources:

```bash
cd weather_risk_bridge/service
docker build -t weather-risk-bridge-service:0.1.0 .
docker run -d --name weather-risk-bridge -p 8099:8099 \
  -e WEATHER_RISK_BRIDGE_TOKEN=replace-me \
  -e WEATHER_RISK_BRIDGE_USER_AGENT="(https://github.com/pHarmG/weather-risk-bridge, you@example.com)" \
  weather-risk-bridge-service:0.1.0
```

Or use the example compose file at `weather_risk_bridge/service/docker-compose.example.yml`.

Point the integration service URL at a host Home Assistant can reach (not `localhost` from inside the HA container).

## Architecture

| Piece | Role |
|-------|------|
| Supervisor add-on / Docker service | Aggregates NWS/SPC (optional WeatherKit) into `/v1/snapshot` |
| `custom_components/weather_risk_bridge` | Polls the service; creates weather + chart sensors |
| Embedded Lovelace card | Renders chart sensors; binds via `location:` slug |

## Versions

Integration, card, and add-on are versioned together. This tree is **0.1.0**.

## License

MIT — see [LICENSE](LICENSE).
