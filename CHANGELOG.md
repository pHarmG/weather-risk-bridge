# Changelog

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
