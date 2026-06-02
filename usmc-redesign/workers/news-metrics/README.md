# News Metrics Worker

Small Cloudflare Worker + D1 API for global news article counters.

## Routes

- `GET /articles/:slug` returns `{ slug, views, reads, updatedAt }`
- `POST /articles/:slug/view` increments `views`
- `POST /articles/:slug/read` increments `reads`

## Cloudflare Setup

1. Create a D1 database named `usmc-news-metrics`.
2. Open the database details page and copy the database ID.
3. Replace `PASTE_D1_DATABASE_ID_HERE` in `wrangler.toml`.

## Local Development

From the app root:

```sh
npm run metrics:migrate:local
npm run metrics:dev
```

In another terminal, run the app:

```sh
cp .env.example .env.local
npm run dev
```

## Production

From the app root:

```sh
npm run metrics:migrate:remote
npm run metrics:deploy
```

Set the frontend build variable to the deployed Worker URL:

```txt
VITE_NEWS_METRICS_URL=https://news-metrics.darkeyegraphics.workers.dev
```

If the production domain changes, update `ALLOWED_ORIGINS` in `wrangler.toml` or set it as a Worker variable in Cloudflare.
