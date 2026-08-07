# Changelog

## 0.1.9

- Reliably advance the embedded card's Lovelace resource URL after a HACS update on both legacy and current Home Assistant releases. The updater now supports Home Assistant's typed Lovelace data key and the newer `resource_mode` field, while retaining the older layout for the stated minimum Home Assistant version. Lovelace is also an explicit integration dependency, so the resource collection exists before the update is attempted.

## 0.1.8

- Replace the timing-based Lovelace resource retry with Home Assistant's component-ready hook. The card resource now updates as soon as Lovelace itself finishes setup, including on systems where it loads after Home Assistant's global started event.

## 0.1.7

- Ensure the integration rechecks Lovelace resources once Home Assistant has fully started, so HACS updates reliably advance the card's cache-busting resource URL even when Lovelace initializes after the short startup retry.

## 0.1.6

- Apply low-cloud-cover scenery selection at night as well: clear-night, partly-cloudy-night, or cloudy-night now follows the same cloud-cover data rather than always falling back to cloudy-night.

## 0.1.5

- Use the current cloud-cover percentage to select clear, partly cloudy, or cloudy scenery after a low-confidence precipitation/storm condition is suppressed. The card now chooses a clear-day scene for the current 5% cloud-cover payload instead of falling back to overcast.

## 0.1.4

- Prevent duplicate, forecast-derived storm condition labels from overriding the ambient-scene probability threshold. Storm backdrops now require observed storm precipitation, an in-effect convective alert, or at least a 35% near-term storm probability.

## 0.1.3

- Prevent a small forecast rain chance from switching the Lovelace card to a rainy backdrop; observed precipitation and meaningful rain or storm probabilities still take precedence.

## 0.1.2

- Docs: product-focused README/app DOCS with card preview screenshots; clearer pitch for the HAOS companion app.
- Reduce Lovelace card CPU: gate `shouldUpdate` on weather-risk entity fingerprints, convert dawn/dusk ambient PNGs to WebP (~12MB → ~0.15MB), soften backdrop blur, drop dead hero spill animation, poll coordinator every 5 minutes, enable static asset cache headers.

## 0.1.1

- Add HACS Action + hassfest CI; set `hacs.json` `country: US`.
- Hassfest fixes: sorted `manifest.json` keys and `config_entry_only_config_schema`.
- GitHub topics/description prepared for `hacs/default` submission.

## 0.1.0

- Initial public distribution: HACS integration with embedded Lovelace card and Home Assistant OS app for the companion service.
- Same-host Service URL: leave the auto-filled Supervisor app IP (`http://172.30.x.x:8099`). Hostname `weather-risk-bridge` is a fallback only.
- Ships local `brand/` icons for Devices & Services (Home Assistant 2026.3+).
- Humidity comfort accents and improved rain-probability sourcing in the companion service.
- App catalogue `icon.png` (128×128) and `logo.png` for the Home Assistant Apps store.
