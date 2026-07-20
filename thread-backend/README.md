# Thread Backend (Cloudflare Worker)

Proxies chat and insights requests to **Azure OpenAI**. The mobile app never holds `AZURE_API_KEY`.

## Setup

1. Set the API key secret (already done if you configured it earlier):

```bash
npx wrangler secret put AZURE_API_KEY
```

2. Edit `wrangler.jsonc` `vars` with your real:

- `AZURE_ENDPOINT` — e.g. `https://myresource.openai.azure.com`
- `AZURE_DEPLOYMENT` — deployment name
- `AZURE_API_VERSION` — tool-calling capable version

For **local** `wrangler dev`, copy `.dev.vars.example` → `.dev.vars` and set `AZURE_API_KEY` (remote secrets are not loaded into local mode by default).

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

- `GET /health`
- `POST /chat` — `{ messages, profile }` → `{ replyText, profile, todayLog }`
- `POST /insights/pattern` — `{ profile, entries }` → `{ pattern }`

## Curl smoke tests

```bash
curl -s http://localhost:8787/health

curl -s -X POST http://localhost:8787/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Hot flashes kept me up again."}],"profile":null}'
```
