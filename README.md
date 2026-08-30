# Personal website

Baris Batur's portfolio: a single-page Next.js 16 app (React 19, Tailwind 4, Node `>=20`). Copy lives in `lib/data.ts`. The **Server telemetry** panel talks to a public API; sample series are generated on the server and labelled as development data.

Use **npm** (`package-lock.json`).

```bash
npm ci
npm run dev          # http://localhost:3000
npm run lint && npm run typecheck && npm test && npm run build
NODE_ENV=production DISABLE_ANALYTICS=1 npm start
```

LAN HMR from another machine: `ALLOWED_DEV_ORIGIN=192.168.10.82` in `.env.local` (no protocol). Template: `.env.example`.

## Content

Edit `lib/data.ts` (schema in `lib/types.ts`). Project links: `href`, optional `sourceHref`, optional `playHref`. The dossier and footer only render `https:` and `mailto:` (`lib/safe-href.ts`).

**Signals** (`components/observability-panel.tsx`) is synthetic data from `lib/data.ts`. **Server telemetry** is a different pipeline.

## Telemetry

The browser only calls `GET /api/telemetry`. It never imports Prometheus, PromQL, or the sample generator (`lib/telemetry-sample.ts` is `server-only`).

```
UI  →  GET /api/telemetry?range=…  →  sanitizer  →  sample (or 503 if TELEMETRY_MODE=live)
```

| File | Role |
| --- | --- |
| `lib/telemetry.ts` | Types, range allowlist, status helper, client fetch |
| `lib/telemetry-sanitizer.ts` | Allowlists `range`; no Prom proxy; public host `lab` |
| `app/api/telemetry/route.ts` | Rate limit, JSON, `force-dynamic` |

`range` must be `1h` | `6h` | `24h` | `7d`. Extra query keys are ignored. Default mode is development (`mode: "development"`, `adapter: "sanitizer"`). `TELEMETRY_MODE=live` is reserved and returns **503** until a locked-down upstream exists. Never put Prom URLs or tokens in `NEXT_PUBLIC_*`.

A failed fetch keeps the last snapshot. The UI never substitutes generated series for a failed live scrape.

```bash
curl -sS 'http://127.0.0.1:3000/api/telemetry?range=1h'
# 400 for unknown range, 429 after 30 req/min/IP, 503 if live/unavailable
```

Rate limit (30/min) and the 15s snapshot cache are **in-process Maps**. They reset on restart and are not shared across replicas. Client IP is `X-Forwarded-For` (first hop) or `X-Real-Ip`. Only trust that header behind a reverse proxy you control.

## Ops

`next start` is HTTP only. Terminate TLS at the edge. Do not publish port 3000 on the internet.

Set `DISABLE_ANALYTICS=1` on self-host (Vercel Analytics is off unless production and this is unset).

There is no `/healthz`. Probe `GET /` or `GET /api/telemetry?range=1h` (the latter is rate-limited).

Security headers (CSP, `frame-ancestors 'none'`, HSTS, `X-Frame-Options: DENY`, no `X-Powered-By`) are in `next.config.mjs`. Production CSP includes `upgrade-insecure-requests`. `.env` is gitignored.

Live scrape later: fixed PromQL templates and secrets stay in the sanitizer; map into the existing snapshot shape; keep `hostname` as the public alias `lab`; never label sample data as live.
