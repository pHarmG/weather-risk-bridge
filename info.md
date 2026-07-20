# Weather Risk Bridge

Home Assistant integration and Lovelace card for US weather risk (NWS/SPC), paired with a Home Assistant app companion service.

## Quick start

1. Install the **Weather Risk Bridge** app (or run the companion service with Docker on this host or another machine — see the README).
2. Install this repository in HACS as an **Integration**, then restart Home Assistant.
3. **Settings → Devices & Services → Add Integration → Weather Risk Bridge**.
4. Service URL: `http://weather-risk-bridge:8099` for the app, or `http://OTHER_HOST_LAN_IP:8099` for Docker on a separate machine.
5. Enter a **label** and your **latitude** / **longitude** (decimal degrees; US west longitudes are negative).
6. Add the card with `location:` matching your label slug (for example `home`).

Full setup, app verification, and separate-host Docker instructions are in the repository README.
