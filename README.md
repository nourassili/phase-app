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
3. The mobile app merges those facts into structured local memory.
4. Coaching and Insights use that memory in later sessions.

The model performs state extraction; local SQLite remains the durable source of truth. This is a deliberate trade-off: Thread favors comfort over completeness. It only records what a user chooses to mention and what the model successfully interprets.

The core loop is:

**talk → remember → track → reveal patterns**

## Current MVP

The application has three tabs:

- **Chat** — the default experience. Users can share a symptom, question, difficult night, or unstructured thought. Thread responds concisely and quietly extracts durable memory and today's observations.
- **Insights** — summarizes symptoms, mood, and sleep mentioned over the latest seven logged days. A user can also ask Thread to identify one cautious, non-diagnostic pattern.
- **Settings** — starts a new conversation while retaining memory, or deletes local conversation, profile, and insight data.

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
├── Chat, Insights, and Settings
├── Local SQLite database (thread.db)
│   ├── anonymous local user ID
│   ├── profile memory
│   ├── daily entries
│   └── conversation history
│
└── HTTPS JSON requests
    │
    ▼
Stateless Cloudflare Worker
│
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
  → app saves the message locally
  → app sends conversation history + current profile to the Worker
  → Azure OpenAI returns a reply and optional structured tool calls
  → Worker normalizes them into profile/today-log updates
  → app merges updates into SQLite
  → future Chat and Insights requests reuse that local context
```

The Worker is intentionally stateless. It protects the Azure API key, applies the coaching prompt, parses `update_memory` and `update_today_log` tool calls, and returns JSON. Persistence and merge behavior belong to the mobile app.

### Local data model

All user-owned records are keyed by an anonymous UUID generated on first launch and stored in `app_meta`.

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

Append-only until the user clears the conversation or deletes her data:

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
| `GET` | `/health` | Worker health check |
| `POST` | `/chat` | Returns `replyText`, an optional profile update, and an optional today-log update |
| `POST` | `/insights/pattern` | Looks across the current profile and recent daily entries for one cautious pattern |

## Technology

- Expo SDK 57 and React Native 0.86
- TypeScript
- React Navigation
- Expo SQLite
- Cloudflare Workers and Wrangler
- Azure OpenAI chat completions with function tools

## Run locally

Expo SDK 57 requires Node.js 22.13 or newer.

### 1. Install dependencies

```bash
npm install
npm --prefix thread-backend install
```

### 2. Configure Azure OpenAI

```bash
cp thread-backend/.dev.vars.example thread-backend/.dev.vars
```

Set `AZURE_API_KEY` in `thread-backend/.dev.vars`. Non-secret defaults for `AZURE_ENDPOINT`, `AZURE_DEPLOYMENT`, and `AZURE_API_VERSION` live in `thread-backend/wrangler.jsonc` and can be overridden locally.

Never commit `.dev.vars`.

### 3. Start the Worker

From the repository root:

```bash
npm run backend
```

The local Worker listens on `http://localhost:8787`.

### 4. Start the app

In a second terminal:

```bash
npm start
```

The app reads its API URL from `expo.extra.apiUrl` in `app.json`, then falls back to `EXPO_PUBLIC_API_URL` and finally `http://localhost:8787`. A physical device cannot reach your computer through `localhost`; set `apiUrl` to your machine's LAN address or a deployed Worker URL.

Other app scripts:

```bash
npm run ios
npm run android
npm run web
```

### Backend commands

```bash
npm --prefix thread-backend test
npm --prefix thread-backend run cf-typegen
npm --prefix thread-backend run deploy
```

For production, store the Azure key as a Worker secret:

```bash
cd thread-backend
npx wrangler secret put AZURE_API_KEY
```

## Privacy and safety: current reality

Thread is an early MVP, not a medical device and not a replacement for a clinician. Current prompts instruct the model not to diagnose or recommend specific treatments, medications, or dosages. Pattern language is also required to avoid claiming causation.

Local persistence does **not** mean chats remain entirely on-device. Conversation history and profile context are sent to the Cloudflare Worker and Azure OpenAI to generate responses. The Worker does not persist application data, but the external processing path must be disclosed clearly during onboarding and in the privacy policy.

Before a real pilot, the project still needs:

- informed consent and accurate privacy copy
- authentication and access control for AI endpoints
- abuse protection and rate limiting
- explicit crisis and emergency escalation behavior
- stronger clinical guardrails and safety evaluation
- request validation and production error handling
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
├── App.tsx                  # mobile app bootstrap
├── src/
│   ├── components/         # shared interface components
│   ├── db/                 # SQLite schema and repositories
│   ├── hooks/              # profile, conversation, and entry state
│   ├── navigation/         # three-tab navigation
│   ├── screens/            # Chat, Insights, and Settings
│   ├── services/api.ts     # Worker API client
│   ├── theme/              # visual tokens
│   └── types/              # application models
└── thread-backend/
    ├── src/index.ts        # Worker routes
    ├── src/azure.ts        # Azure transport and tool-call parsing
    ├── src/prompts.ts      # coaching, memory, and pattern prompts
    └── test/               # Worker tests
```

## Status

This repository is an actively developed MVP. Its immediate goal is to make a small, closed pilot reasonable by addressing connectivity, privacy, access control, consent, and clinical safety before measuring retention.

---
