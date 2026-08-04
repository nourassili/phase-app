# Thread Backend (Cloudflare Worker)

Proxies chat and insights requests to **Azure OpenAI**. The mobile app never holds `AZURE_API_KEY`.

AI endpoints require a valid **Supabase user access token** (`Authorization: Bearer <jwt>`). `/health` stays public.

## Setup

1. Set secrets / local env:

```bash
npx wrangler secret put AZURE_API_KEY
# Optional: only if you still verify HS256 with the legacy secret
# npx wrangler secret put SUPABASE_JWT_SECRET
```

2. Edit `wrangler.jsonc` `vars` (or `.dev.vars` locally) with:

- `AZURE_ENDPOINT` — e.g. `https://myresource.openai.azure.com`
- `AZURE_DEPLOYMENT` — deployment name
- `AZURE_API_VERSION` — tool-calling capable version
- `SUPABASE_URL` — e.g. `https://YOUR_PROJECT.supabase.co` (JWKS verification)
- `CORS_ORIGINS` — `*` or comma-separated browser origins

For **local** `wrangler dev`, copy `.dev.vars.example` → `.dev.vars` and set at least:

- `AZURE_API_KEY`
- `SUPABASE_URL`
- `CORS_ORIGINS=*` (typical for native Expo / local)

`SUPABASE_JWT_SECRET` is optional. Prefer JWKS via `SUPABASE_URL` when the project uses JWT Signing Keys (e.g. ECC P-256). The legacy JWT secret (Dashboard → Project Settings → API / JWT Keys) is only needed for HS256 fallback.

Never commit `.dev.vars`.

3. Regenerate types after Env changes:

```bash
npm run cf-typegen
```

## Dev

From the **repo root** (`Phase/`), not this folder:

```bash
# Terminal 1 — Worker
npm run backend

# Terminal 2 — Expo app
npx expo start
```

Or from this folder only for the Worker:

```bash
npm run dev
# listens on http://localhost:8787
```

Do **not** run `npx expo start` inside `thread-backend/` — that is the Cloudflare Worker, not the mobile app.

## Endpoints

- `GET /health` — public
- `POST /chat` — auth required — `{ messages, profile }` → `{ replyText, profile, todayLog }`
- `POST /insights/pattern` — auth required — `{ profile, entries }` → `{ pattern }`

## Curl smoke tests

```bash
# public
curl -s http://localhost:8787/health

# expect 401 without a token
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8787/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"hi"}],"profile":null}'

# expect 200 with a real Supabase user access_token
curl -s -X POST http://localhost:8787/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Hot flashes kept me up again."}],"profile":null}'
```

## Deploy

```bash
npx wrangler secret put AZURE_API_KEY
# Set SUPABASE_URL and CORS_ORIGINS in wrangler.jsonc vars (or secrets)
npx wrangler deploy
```

After deploy, point the Expo app at the Worker URL (`expo.extra.apiUrl` / `EXPO_PUBLIC_API_URL`).
