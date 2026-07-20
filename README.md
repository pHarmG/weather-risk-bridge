# Weather Risk Bridge

US-focused weather risk dashboard for Home Assistant: companion service + config-flow integration + Lovelace card.

**Data coverage:** United States only (NWS + SPC). Non-US coordinates are not supported.

---

## Setup overview

You will do three things:

1. Run the **companion service** (Supervisor add-on recommended, or Docker).
2. Install the **Home Assistant integration** and enter **your location’s latitude and longitude**.
3. Add the **Lovelace card**, bound to that location.

The integration polls the companion service using the coordinates you provide. Those coordinates drive all forecasts, risk charts, and alerts for that location.

---

## Step 1 — Install the companion service (add-on)

1. Open Home Assistant → **Settings → Add-ons → Add-on store**.
2. Open the menu (**⋮**) → **Repositories**.
3. Add: `https://github.com/pHarmG/weather-risk-bridge`
4. Find **Weather Risk Bridge** in the store → **Install** → **Start**.
5. Confirm the add-on is running (logs should show it listening on port `8099`).
6. Optional: open **Configuration** and set a bearer `token` if you want API access locked down.

From Home Assistant Core, the add-on URL is:

```text
http://weather-risk-bridge:8099
```

Leave that as the integration’s service URL in Step 2 unless you run Docker on another host.

---

## Step 2 — Install the integration (HACS)

1. Open **HACS → Integrations**.
2. Menu (**⋮**) → **Custom repositories**.
3. Repository: `https://github.com/pHarmG/weather-risk-bridge`
4. Category: **Integration** → **Add**.
5. Search for **Weather Risk Bridge** → **Download**.
6. **Restart Home Assistant**.

---

## Step 3 — Configure your location (coordinates)

This is the step that points Weather Risk Bridge at **your** place.

1. Go to **Settings → Devices & Services → Add Integration**.
2. Search for **Weather Risk Bridge** and open it.
3. Fill in the form:

| Field | What to enter |
|-------|----------------|
| **Service URL** | Keep `http://weather-risk-bridge:8099` if you use the add-on. For Docker on another machine, use a URL Home Assistant can reach (for example `http://192.168.1.50:8099`). Do **not** use `localhost` from inside the HA container unless the service is in the same container network under that name. |
| **Bearer token** | Only if you set a token on the add-on/service. Otherwise leave blank. |
| **Label** | Friendly name for this place, for example `Home` or `Cabin`. This becomes the entity slug (e.g. `home` → `weather.weather_risk_bridge_home`). |
| **Latitude** | Decimal degrees for your location (north positive). Example: `30.2672`. |
| **Longitude** | Decimal degrees for your location (west is **negative** in the US). Example: `-97.7431`. |
| **Wind threshold (mph)** | Gust threshold used for the strong-wind risk series (`30`, `40`, `50`, or `60`). Default `40` is fine for most users. |

4. Submit. Home Assistant creates weather and chart sensors for that location.

### How to find your latitude and longitude

Use any of these:

- **Home Assistant’s own location:** **Settings → System → General** shows the home latitude/longitude. The Weather Risk Bridge form usually **pre-fills** those values — change them if this card should track a different place.
- **Google Maps:** right-click your address → the first two numbers are latitude and longitude (copy both).
- **gps-coordinates.net** or similar: search your address and copy the decimal pair.

Tips:

- US longitudes are typically between about `-65` and `-125` (negative).
- Enter decimals, not degrees/minutes/seconds.
- You can add **multiple** locations later by adding the integration again with a different label and coordinates.

### Reconfigure later

**Settings → Devices & Services → Weather Risk Bridge → Configure / Reconfigure** (or the integration options) to change coordinates, label, service URL, token, or wind threshold.

You can also set or update a location from the **card editor** → **Location setup** (same fields: label, latitude, longitude, service URL, token, wind threshold).

---

## Step 4 — Add the Lovelace card

1. Open a dashboard → **Edit** → **Add card**.
2. Choose **Weather Risk Bridge** (or add via YAML below).
3. Set **Configured location** / **Location key** to the slug from your label (for example `home` for label `Home`).

YAML example:

```yaml
type: custom:weather-risk-bridge-card
location: home
title: Home Weather Risk
default_range: 12
```

The card does **not** fetch weather by itself. It renders the entities created for the location you configured in Step 3. If the card is empty, confirm the `location:` slug matches the integration label slug and that the chart sensors exist under **Developer Tools → States**.

### YAML-mode Lovelace (resource)

If Lovelace is in YAML mode, auto-registration is skipped. Add:

```yaml
resources:
  - url: /weather_risk_bridge/weather-risk-bridge-card.js
    type: module
```

Storage-mode Lovelace (the default) registers this resource automatically after the integration loads.

---

## Docker alternative (no add-on)

```bash
cd weather_risk_bridge/service
docker build -t weather-risk-bridge-service:0.1.0 .
docker run -d --name weather-risk-bridge -p 8099:8099 \
  -e WEATHER_RISK_BRIDGE_TOKEN=replace-me \
  -e WEATHER_RISK_BRIDGE_USER_AGENT="(https://github.com/pHarmG/weather-risk-bridge, you@example.com)" \
  weather-risk-bridge-service:0.1.0
```

Or use `weather_risk_bridge/service/docker-compose.example.yml`.

Then in Step 3, set **Service URL** to a host/IP Home Assistant can reach on port `8099`, and still enter **your** latitude and longitude.

---

## Architecture

| Piece | Role |
|-------|------|
| Supervisor add-on / Docker service | Aggregates NWS/SPC (optional WeatherKit) into `/v1/snapshot` using the lat/lon you configure |
| `custom_components/weather_risk_bridge` | Stores your location; polls the service; creates weather + chart sensors |
| Embedded Lovelace card | Renders those sensors for a `location:` slug |

## Versions

Integration, card, and add-on are versioned together. This tree is **0.1.0**.

## License

MIT — see [LICENSE](LICENSE).
