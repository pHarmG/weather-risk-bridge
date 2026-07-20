# Weather Risk Bridge

Home Assistant integration and Lovelace card for US weather risk (NWS/SPC), paired with a Supervisor add-on companion service.

## Quick start

1. Install the **Weather Risk Bridge** add-on from this repository and start it.
2. Install this repository in HACS as an **Integration**, then restart Home Assistant.
3. **Settings → Devices & Services → Add Integration → Weather Risk Bridge**.
4. Keep the default service URL `http://weather-risk-bridge:8099` when using the add-on.
5. Enter a **label** (for example `Home`) and your location’s **latitude** and **longitude** in decimal degrees (US west longitudes are negative). Home Assistant often pre-fills your HA home coordinates — adjust them if needed.
6. Add the **Weather Risk Bridge** card to a dashboard and set `location:` to the slug from your label (for example `home`).

Those coordinates drive the forecasts and risk charts. US locations only. Full setup details are in the repository README.
