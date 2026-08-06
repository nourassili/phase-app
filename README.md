# Mycelia Health - Phase MVP

Thread is Mycelia's conversational AI health companion for women navigating perimenopause and menopause. It learns from natural conversation, remembers what matters, and turns what a woman already shares into useful context and patterns—without asking her to maintain another health tracker.

> A coach who knows your baseline, constraints, and context, so you do not have to start from zero in every conversation.

## Why this exists

Menopause is a universal life stage, yet midlife women's health remains under-supported:

- Healthcare professionals often receive limited training in menopause even though many women spend more than one-third of their lives in this stage, when risks for several chronic conditions also increase.
- Online health misinformation makes it difficult to separate useful guidance from confident but inaccurate advice. Research cited during product discovery reports that 3 in 5 women have acted on inaccurate online health information (Medscape), while digital health myths disproportionately affect younger women (Coda Media).
- Across interviews about PCOS, menopause, fertility, and hormonal health, the common thread was not a lack of data. It was dismissal, misdiagnosis, fragmented context, and advice that did not account for the woman's history or life.

These groups do not have identical needs. A 45-year-old managing menopause and a 22-year-old with PCOS who is concerned about fertility have different stakes and windows of urgency. The MVP therefore starts narrowly with conversational coaching for perimenopause and menopause rather than pretending one generic experience can serve every hormonal life stage.

**Women are being failed by care systems, then failed again by apps that add friction instead of removing it.**

## Product thesis

Most health apps begin with a fixed schema and make the user fill it: symptoms, mood, sleep, nutrition, exercise, and more. Thread reverses the capture experience:

1. She talks naturally.
2. The model extracts relevant facts from the conversation.
3. The mobile app merges those facts into her cloud profile and daily logs (Supabase).
4. Coaching and Insights use that memory in later sessions.

The model performs state extraction; Supabase Postgres (with RLS) is the durable source of truth. This is a deliberate trade-off: Thread favors comfort over completeness. It only records what a user chooses to mention and what the model successfully interprets.

The core loop is:

**talk → remember → track → reveal patterns**

## Current MVP

After sign-in, a short onboarding covers consent and an optional stage / "hardest right now" seed. Then three tabs:

- **Chat** — the default experience. Users can share a symptom, question, difficult night, or unstructured thought. Thread responds concisely and quietly extracts durable memory and today's observations.
- **Insights** — summarizes symptoms, mood, and sleep mentioned over the latest seven logged days. A user can also ask Thread to identify one cautious, non-diagnostic pattern.
- **Settings** — account/password, new conversation, erase memory (consent/onboarding preserved), privacy and crisis links.

Thread currently extracts:

- hormonal stage
- recurring symptoms
- possible triggers
- interventions that helped
- durable notes and context
- today's mood, sleep quality, and symptoms

There are no manual logging forms, streak penalties, or reminder loops in this MVP.

## Architecture

```text
Expo / React Native mobile app
│
├── Auth (Supabase email/password)
├── Onboarding (consent + optional seed)
├── Chat, Insights, and Settings
├── Supabase Postgres (RLS)
│   ├── profiles (memory + consent/onboarding)
│   ├── daily_entries
│   └── conversation_messages
│
└── HTTPS JSON + Bearer JWT
    │
    ▼
Stateless Cloudflare Worker
│
├── JWT verification (Supabase JWKS / optional HS256)
├── rate limiting + request validation
├── menopause-oriented system prompts
├── structured tool-call parsing
└── no application database
    │
    ▼
Azure OpenAI
```

### Chat data flow

```text
User message
  → app saves the message in Supabase
  → app sends conversation history + current profile to the Worker (Bearer token)
  → Azure OpenAI returns a reply and optional structured tool calls
  → Worker normalizes them into profile/today-log updates
  → app merges updates into Supabase
  → future Chat and Insights requests reuse that cloud context
```

The Worker is intentionally stateless. It protects the Azure API key, applies the coaching prompt, parses `update_memory` and `update_today_log` tool calls, and returns JSON. Persistence and merge behavior belong to the mobile app.

### Cloud data model

All user-owned rows are keyed by `auth.users.id` with RLS so each user only reads/writes her own data. Apply SQL in `supabase/migrations/` (run `001_init.sql`, then `002_onboarding.sql` if the project already had `001`).

#### `profiles`

One row per user:

```ts
type Profile = {
  userId: string;
  stage: string | null;
  symptoms: string[];
  triggers: string[];
  helps: string[];
  notes: string[];
  updatedAt: string;
  consentedAt: string | null;
  consentVersion: string | null;
  onboardingCompletedAt: string | null;
};
```

#### `daily_entries`

One row per user per `YYYY-MM-DD`. New symptoms are merged with existing symptoms for that day.

```ts
type DailyEntry = {
  userId: string;
  date: string;
  mood: string | null;
  sleepQuality: string | null;
  symptoms: string[];
};
```

#### `conversation_messages`

Append-only until the user clears the conversation or deletes her memory:

```ts
type ConversationMessage = {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  displayText: string;
  createdAt: string;
};
```

### Worker API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Worker health check (public) |
| `POST` | `/chat` | Auth required. Returns `replyText`, optional profile update, optional today-log update |
| `POST` | `/insights/pattern` | Auth required. One cautious pattern from profile + recent daily entries |

Protected routes enforce Bearer JWT auth, basic per-isolate rate limiting, and request shape validation.

## Technology

- Expo SDK 57 and React Native 0.86
- TypeScript
- React Navigation
- Supabase Auth + Postgres (RLS)
- Cloudflare Workers and Wrangler
- Azure OpenAI chat completions with function tools
- EAS Build / Submit for TestFlight (`com.thread.nucleus`)

## Run locally

Expo SDK 57 requires Node.js 22.13 or newer.

### 1. Install dependencies

```bash
npm install
npm --prefix thread-backend install
```

### 2. Configure the app

```bash
cp .env.example .env
```

Set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_KEY`
- `EXPO_PUBLIC_API_URL` — `http://localhost:8787` locally (use your LAN IP on a physical device)

### 3. Configure the Worker (Azure + Supabase auth)

```bash
cp thread-backend/.dev.vars.example thread-backend/.dev.vars
```

In `thread-backend/.dev.vars` set:

- `AZURE_API_KEY`
- `SUPABASE_URL` — same project URL as `EXPO_PUBLIC_SUPABASE_URL` (used for JWKS JWT verification)
- `CORS_ORIGINS=*` — fine for native Expo / TestFlight; tighten only if you add a browser client
- `SUPABASE_JWT_SECRET` — optional HS256 fallback; not required when using JWT Signing Keys (ECC/RSA)

Non-secret defaults for `AZURE_ENDPOINT`, `AZURE_DEPLOYMENT`, and `AZURE_API_VERSION` live in `thread-backend/wrangler.jsonc` and can be overridden locally.

Never commit `.env` or `.dev.vars`.

### 4. Apply Supabase migrations

In the Supabase SQL Editor, run `supabase/migrations/001_init.sql`. If that was already applied before onboarding columns existed, also run `002_onboarding.sql`.

### 5. Start the Worker

From the repository root:

```bash
npm run backend
```

The local Worker listens on `http://localhost:8787`.

### 6. Start the app

In a second terminal:

```bash
npm start
```

The app resolves its API URL from `EXPO_PUBLIC_API_URL` (via `app.config.ts` → `expo.extra.apiUrl`), defaulting to `http://localhost:8787` for local dev. A physical device cannot reach your computer through `localhost`; set `EXPO_PUBLIC_API_URL` to your machine's LAN address or use an EAS preview/production build (those profiles point at the deployed Worker).

Other app scripts:

```bash
npm run ios
npm run android
npm run web
```

### TestFlight via EAS

Closed TestFlight for invited testers (not a public App Store release).

**Prerequisites**

- Expo account
- Apple Developer Program membership
- App Store Connect app with bundle ID **`com.thread.nucleus`** (iOS and Android package in `app.config.ts`)
- Deployed Worker with Supabase JWT auth (redeploy `thread-backend` before inviting testers)
- Never commit `.env` or `thread-backend/.dev.vars`

**One-time setup**

```bash
npm install -g eas-cli
eas login
cd /path/to/phase-app
```

`app.config.ts` already includes the EAS `projectId`. If you need to re-link: `eas init` / `eas build:configure`.

Set Supabase env vars on EAS for release builds (required for sign-in; do not commit secrets):

```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT.supabase.co" --environment production --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_KEY --value "YOUR_PUBLISHABLE_OR_ANON_KEY" --environment production --visibility sensitive
```

Repeat for the `preview` environment if you use `--profile preview`.  
`EXPO_PUBLIC_API_URL` for preview/production is already set in `eas.json` to the deployed Worker.

**Build and submit (TestFlight)**

```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

Then in App Store Connect → TestFlight, add internal (or external) testers by email. Testers install via the TestFlight app from anywhere with internet — only people you invite, not the public App Store.

Optional internal device build (not TestFlight):

```bash
eas build --platform ios --profile preview
```

### Backend commands

```bash
npm --prefix thread-backend test
npm --prefix thread-backend run cf-typegen
npm --prefix thread-backend run deploy
```

For production, store secrets and set auth-related vars on the Worker:

```bash
cd thread-backend
npx wrangler secret put AZURE_API_KEY
# Optional HS256 fallback only:
# npx wrangler secret put SUPABASE_JWT_SECRET
```

Also set `SUPABASE_URL` and `CORS_ORIGINS` (wrangler `vars` or secrets). AI routes require `Authorization: Bearer <supabase access_token>`; `/health` stays public.

## Privacy and safety: current reality

Thread is an early MVP, not a medical device and not a replacement for a clinician. Current prompts instruct the model not to diagnose or recommend specific treatments, medications, or dosages. Pattern language is also required to avoid claiming causation. Crisis intent is handled with a short escalation to emergency / crisis lines (US: 988), also linked in Settings.

Conversation history and profile context are stored in Supabase and sent to the Cloudflare Worker and Azure OpenAI to generate responses. The Worker does not persist application data. Onboarding requires consent; Settings privacy copy matches that disclosure.

Still needed before a larger or clinical-facing release:

- stronger clinical guardrails and safety evaluation
- verified retention and data-processing policies for external providers
- tests for health-safety behavior, memory extraction, deletion, and chat flows

RAG over vetted medical sources is a future initiative, not part of the current implementation.

## Product strategy

The MVP is validating coaching before investing in a larger analytics product:

1. **Coaching** — does Thread become more useful as it learns about a user, and does that feel meaningfully different from repeating context in a general-purpose chatbot?
2. **Insights** — once the coaching loop is validated, build a richer analytics layer that can query longitudinal user data and reveal patterns that are difficult to see in one conversation.

The durable advantage is not chat alone. It is the user-owned relationship between conversation, longitudinal memory, and an insights layer designed around women's hormonal health.

The near-term test is simple:

> Does she come back and talk to Thread again without being prompted, and does the second conversation feel noticeably better because it remembers the first?

## Repository structure

```text
.
├── App.tsx                  # mobile app bootstrap + auth/onboarding gate
├── app.config.ts            # Expo config (bundle ID com.thread.nucleus, EAS projectId)
├── eas.json                 # EAS Build / Submit profiles
├── .env.example             # app env template
├── supabase/migrations/     # Postgres + RLS
├── src/
│   ├── auth/               # Supabase auth context
│   ├── components/         # shared interface components
│   ├── constants/          # onboarding copy and options
│   ├── db/                 # Supabase repositories
│   ├── hooks/              # profile, conversation, and entry state
│   ├── navigation/         # three-tab navigation
│   ├── screens/            # Chat, Insights, Settings, onboarding
│   ├── services/api.ts     # Worker API client
│   ├── theme/              # visual tokens
│   └── types/              # application models
└── thread-backend/
    ├── src/index.ts        # Worker routes
    ├── src/auth.ts         # JWT gate
    ├── src/rateLimit.ts    # AI route rate limiting
    ├── src/validate.ts     # request validation
    ├── src/azure.ts        # Azure transport and tool-call parsing
    ├── src/prompts.ts      # coaching, memory, and pattern prompts
    └── test/               # Worker tests
```

## Status

This repository is an actively developed MVP. Its immediate goal is a small, closed TestFlight pilot: consent onboarding, access control, basic rate limiting, and crisis escalation are in place so retention of the coaching loop can be measured.

---
