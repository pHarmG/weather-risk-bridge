# Weather Risk Bridge

US-focused weather risk dashboard for Home Assistant: companion service + config-flow integration + Lovelace card.

**Data coverage:** United States only (NWS + SPC). Non-US coordinates are not supported.

---

## Setup overview

You will do three things:

1. Run the **companion service** (Supervisor add-on on the HA host, **or** Docker on the HA host / a separate machine).
2. Install the **Home Assistant integration** and enter **your location’s latitude and longitude**.
3. Add the **Lovelace card**, bound to that location.

The integration polls the companion service using the coordinates you provide. Those coordinates drive all forecasts, risk charts, and alerts for that location.

**Which service install should I pick?**

| Path | Use when |
|------|----------|
| **Supervisor add-on** (recommended) | You run Home Assistant OS / Supervised and want the fewest moving parts. Service runs on the same appliance as HA. |
| **Docker on another machine** | You want the API on a separate always-on host (NAS, mini PC, Linux box, etc.) while Home Assistant stays on its own device. This is a supported first-class setup. |
| **Docker on the HA host** | You prefer compose/containers but are not using (or cannot use) the add-on store. |

---

## Step 1 — Install the companion service (add-on)

Skip this section if you are using [Docker instead](#docker-alternative-separate-host-or-same-host).

### 1.1 Add this repository to Home Assistant

1. Open Home Assistant in your browser.
2. Go to **Settings → Add-ons**.
3. Open the **Add-on store** (button at the lower right on most installs).
4. Click the **⋮** menu (top right of the Add-on store) → **Repositories**.
5. Paste this URL and click **Add**:

   `https://github.com/pHarmG/weather-risk-bridge`

6. Close the repositories dialog. Refresh the Add-on store if the new add-on does not appear yet (pull-to-refresh on mobile, or leave and re-enter the store).

### 1.2 Install the add-on

1. In the Add-on store, search for **Weather Risk Bridge**.
2. Open it → click **Install** and wait until install finishes (first build can take a few minutes).
3. Leave **Start on boot** enabled (recommended).
4. Optional but useful: enable **Watchdog** so Supervisor restarts the add-on if it crashes.
5. Optional: open the **Configuration** tab before the first start:
   - **`port`**: leave `8099` unless you know you need another host port.
   - **`token`**: leave empty for a first install, **or** set a long random string now if you want the API to require a bearer token (you must enter the same value later in the HA integration).
   - **`user_agent`**: leave the default unless NWS asks you to identify differently.
6. Click **Save** if you changed configuration.

### 1.3 Start it and confirm it is actually running

1. Open the **Info** tab → click **Start**.
2. Wait until the UI shows the add-on as **running** (not “stopped” / “error”).
3. Open the **Log** tab. You want a clean start without a Python traceback. A healthy start typically mentions listening / serving on port `8099`.
4. Still on the add-on page, open **Info** again and confirm CPU/RAM are non-zero after a few seconds (idle is fine; “running” with immediate exit in the log is not).
5. Optional health check from any machine on your LAN that can reach Home Assistant’s host IP on the mapped port:

   ```bash
   curl -sS http://HOME_ASSISTANT_HOST_IP:8099/healthz
   ```

   Expect a successful HTTP response (not connection refused). If this fails from your laptop but the add-on log looks fine, check that port `8099/tcp` is published in the add-on **Configuration / Network** section and that your firewall allows it.

### 1.4 Service URL for the next steps

From Home Assistant Core to this add-on, use:

```text
http://weather-risk-bridge:8099
```

That hostname is the add-on’s DNS name on the Supervisor network. You will paste it into the integration form in Step 3 unless you chose Docker on another host.

---

## Step 2 — Install the integration (HACS)

1. Open **HACS → Integrations**.
2. Menu (**⋮**) → **Custom repositories**.
3. Repository: `https://github.com/pHarmG/weather-risk-bridge`
4. Category: **Integration** → **Add**.
5. Search for **Weather Risk Bridge** → **Download** / **Install**.
6. When HACS finishes, **restart Home Assistant** (**Settings → System → Restart**).
7. After restart, confirm under **Settings → Devices & Services** that you can **Add Integration** and see **Weather Risk Bridge** in the search list.

The Lovelace card JavaScript is bundled with the integration and auto-registered in storage-mode Lovelace. You do not copy files into `/config/www` for the normal install path.

---

## Step 3 — Configure your location (coordinates)

This is the step that points Weather Risk Bridge at **your** place.

1. Go to **Settings → Devices & Services → Add Integration**.
2. Search for **Weather Risk Bridge** and open it.
3. Fill in the form:

| Field | What to enter |
|-------|----------------|
| **Service URL** | Add-on: keep `http://weather-risk-bridge:8099`. Docker on another machine: `http://THAT_HOST_LAN_IP:8099` (example `http://192.168.1.50:8099`). Do **not** use `http://localhost:8099` from Home Assistant if the service runs in a different container or on a different computer — `localhost` inside HA means HA itself, not your other host. |
| **Bearer token** | Must match the add-on/Docker `token` if you set one. Otherwise leave blank. |
| **Label** | Friendly name for this place, for example `Home` or `Cabin`. This becomes the entity slug (e.g. `home` → `weather.weather_risk_bridge_home`). |
| **Latitude** | Decimal degrees for your location (north positive). Example: `30.2672`. |
| **Longitude** | Decimal degrees for your location (west is **negative** in the US). Example: `-97.7431`. |
| **Wind threshold (mph)** | Gust threshold used for the strong-wind risk series (`30`, `40`, `50`, or `60`). Default `40` is fine for most users. |

4. Submit. If it errors with “cannot connect”, the service URL or token is wrong, or the companion service is not reachable from Home Assistant — fix Step 1 / Docker networking first.
5. When it succeeds, Home Assistant creates weather and chart sensors for that location. Check **Developer Tools → States** for entities like `weather.weather_risk_bridge_home` and `sensor.weather_risk_bridge_home_chart_12h`.

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

## Docker alternative (separate host or same host)

Use Docker when you do **not** want the Supervisor add-on, or when you want the companion API on a **different machine** than Home Assistant.

That split is intentional and supported: Home Assistant only needs HTTP access to the service. Many installs run HA on one device (for example a Raspberry Pi / HA Green / VM) and run this API on another always-on box (mini PC, NAS, Linux server). The integration’s **Service URL** is simply pointed at that other host’s LAN address.

### What you need

- Docker Engine (and optionally Docker Compose) on the machine that will run the service
- Port `8099/tcp` reachable **from the Home Assistant host** (same LAN or routed network)
- A clone or download of this repository on the Docker host (for the `weather_risk_bridge/service` build context)

### Build and run (docker run)

On the **Docker host** (not necessarily the HA host):

```bash
git clone https://github.com/pHarmG/weather-risk-bridge.git
cd weather-risk-bridge/weather_risk_bridge/service

docker build -t weather-risk-bridge-service:0.1.0 .

docker run -d \
  --name weather-risk-bridge \
  --restart unless-stopped \
  -p 8099:8099 \
  -e WEATHER_RISK_BRIDGE_PORT=8099 \
  -e WEATHER_RISK_BRIDGE_TOKEN=replace-me \
  -e WEATHER_RISK_BRIDGE_USER_AGENT="(https://github.com/pHarmG/weather-risk-bridge, you@example.com)" \
  weather-risk-bridge-service:0.1.0
```

Environment variables:

| Variable | Meaning |
|----------|---------|
| `WEATHER_RISK_BRIDGE_PORT` | Listen port inside the container (keep `8099` unless you also change `-p`). |
| `WEATHER_RISK_BRIDGE_TOKEN` | Optional shared secret. If set, the HA integration must use the same value as **Bearer token**. Use a real secret instead of `replace-me` if you enable it; or omit the `-e` line to run without auth. |
| `WEATHER_RISK_BRIDGE_USER_AGENT` | Identifies your client to api.weather.gov. Put a contact email you monitor in place of `you@example.com`. |

### Or use Compose

```bash
cd weather-risk-bridge/weather_risk_bridge/service
# edit docker-compose.example.yml: set token / user_agent, then:
docker compose -f docker-compose.example.yml up -d --build
```

### Verify the service before configuring Home Assistant

From the Docker host:

```bash
curl -sS http://127.0.0.1:8099/healthz
```

From another machine on the LAN (or from the HA host):

```bash
curl -sS http://DOCKER_HOST_LAN_IP:8099/healthz
```

If local curl works but HA cannot connect, it is almost always firewall, wrong IP, or the container not publishing `-p 8099:8099`.

### Point the integration at the Docker host

Continue with [Step 2](#step-2--install-the-integration-hacs) and [Step 3](#step-3--configure-your-location-coordinates), but set:

```text
http://DOCKER_HOST_LAN_IP:8099
```

Examples:

- Service on `192.168.1.50` → `http://192.168.1.50:8099`
- Service on a hostname your HA DNS resolves → `http://weather-box.local:8099` (only if HA can resolve it)

Still enter **your** latitude and longitude in Step 3. The remote service does not know your location until the integration sends it.

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
