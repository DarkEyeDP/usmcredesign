# Daily Marine Corps History Hero

This module lets the home hero swap to a date-specific Marine Corps history feature on page load.

## Toggle

Set these Vite env vars as needed:

- `VITE_DAILY_HISTORY_HERO_ENABLED=false` turns the feature off.
- `VITE_DAILY_HISTORY_HERO_MODE=replace` shows only the daily history hero when a date matches.
- `VITE_DAILY_HISTORY_HERO_MODE=prepend` puts the daily history hero first, then continues the normal carousel.
- `VITE_DAILY_HISTORY_TIMEZONE=America/New_York` controls which calendar day is used.
- `VITE_DAILY_HISTORY_PREVIEW_DATE=11-10` previews a date locally.

The default is enabled, `replace` mode, and Eastern time.

## Add Events

Edit `dailyHistoryEvents.ts`.

Use `dateKey` in `MM-DD` format. Add image assets under `public/history/images/` and reference them as `/history/images/example.webp`. Leave `image` empty until you have approved art; the hero will use the existing heritage fallback image.

For videos, add entries to `../hero/heroVideos.ts` and set the matching `videoId` on the event.

## Research Notes

The starter set is a curated list of high-signal dates from Marine Corps History Division material, plus specific references for Iwo Jima and Montford Point. The `source` field stays with each event so you can audit entries as the calendar grows.
