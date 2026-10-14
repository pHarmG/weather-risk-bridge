# Changelog

## 0.2.2

- Rebuilt the visual card editor: settings are grouped into View, Axes and labels, and Hazards and alerts sections, with every choice shown as a dropdown in aligned two-column rows and concise help text. The unused "Card title" field is gone.
- Fixed the editor's Quiet threshold and Alert chip limit having no effect: the editor saves them as text and the card previously ignored that, falling back to its defaults.
- New defaults for a smoother, more readable card: line charts, 12-hour starting range, and a 5% quiet-hazard threshold. Existing explicit settings, including `chart_style: bars`, are kept.
- The 5d range is only offered once the 120h forecast actually has data, so a newer integration paired with an older companion app no longer shows an empty 5-day chart.
- Wind, humidity and dew point pills share the hero row equally, and on narrower cards the pill row spans the full hero width so values are no longer cut off.

## 0.2.1

- Cold-weather alerts (freeze, frost, wind chill, winter, ice, snow) now use a frost palette in the hero: an icy pill with a pale rime edge, and matching frosty alert chips. Heat alerts keep the warm palette.
- Humidity and dew point pills are more saturated, with stronger borders, so they no longer blend into bright backgrounds.

## 0.2.0

- Add a "Chart style" card option (`bars` default, `line`). Line mode renders every series panel as a smooth monotone-cubic curve with a soft gradient fill and a highlighted dot on the current period, and draws feels-like temperatures as a dashed secondary curve instead of per-bar dashes. The temperature line samples the same per-degree color palette as the bars via an axis-mapped gradient, so pleasant dips stay green/yellow and hot peaks read orange instead of exaggerating the range. Value labels, tooltips, and tap targets all keep working in both styles. Configurable from the visual card editor and YAML (`chart_style: line`).
- Introduce an optional 5-day view as the new highest horizon. The service widens its hourly window from 48 to 120 hours, bins the `120h` horizon into twenty 6-hour series points, and extends the daily forecast from 3 to 5 days; the integration exposes new `chart_120h` / `summary_120h` / risk-max sensors. The card shows a `5d` range button automatically once the new sensor exists. Multi-day horizons (24h and longer, compact x-axis labels) now render day headers such as "Wed, Oct 14" inside the top of each panel with dotted midnight separators, while the x-axis keeps clean hour labels; this applies to both chart styles. The 5-day view uses the same compact chart width as the other horizons with value labels decimated by the existing density rules instead of widening the SVG. On dense horizons the temperature label cadence now follows the x-axis rhythm (every 12 hours for the 5-day view) and feels-like labels ride along with temperature labels instead of disappearing. Card range/default-range pickers include the 5-day option, and `default_range` now tolerates string values from the visual editor.
- Lay the hero wind, humidity, and dew point pills out on a single row (UVI and hail outlook pills remain on their own rows), freeing vertical space in the card header.
- Add a "Value labels" option (`label_dedupe`, off by default). When enabled, a panel hides a value label that repeats the previously shown value and only writes the next one when the value changes, with the current period always labeled — pairing naturally with dense horizons and the compact x-axis rhythm.
- Storm chance on the precipitation panel keeps the per-bar storm caps and sparks in bar mode; line mode draws it as a pale-gold "electric" trace with a soft glow, a slow current pulse, and bolt markers at high-energy peaks. A small legend in the panel header lists only the markers actually drawn.
- Show hail on the precipitation chart. The service now publishes an hourly `hail` series whose value is an SPC-shaped estimate (the day-1/2 SPC hail outlook percentage scaled by each hour's storm chance, peak storm hour = full SPC value, never above it) plus a `flagged` marker for NWS large-hail grid annotations or "hail" in the forecast text. The card draws 1–3 ice stones per window by estimate (brighter when NWS-flagged) and the tooltip reads e.g. "Storm 70% · Hail ~14% est. · NWS flag". Hail alone no longer affects which panels are shown.
- Combine Strong winds and Tornado into one "Wind & tornado" panel: wind bars/line use a teal palette that deepens with probability and carry drifting, curled wind streaks (plus a gust highlight along the line); tornado rides on the same axis as a magenta core bar or dashed trace. Wind panels now have tap tooltips.
- Animate precipitation subtly with a texture chosen per window from the forecast condition (falling back to temperature): rain drops, swaying snowflakes, or wintry mix. Loops are seamless, and all SVG motion is skipped under `prefers-reduced-motion`.
- Every hero pill now uses the card's floating tooltip instead of the browser title: hover previews it, click or tap pins it, tapping elsewhere dismisses it.
- Readability and polish: alert pills and chips sit on a dark tinted base so they stay legible over bright scenes (snow, clear day); feels-like caps span the full bar width; temperature value labels match the feels-like size and every bar is labeled when bars are at least 18px wide; "NN°" labels are optically centred on their bars; the first and last value labels no longer drift off their bars; bars are 20% softer (precipitation 36%).

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
