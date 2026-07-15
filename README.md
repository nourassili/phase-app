# Phase — AI Wellness Coaching

Phase is a RAG-based coaching product built to give women clear, trustworthy guidance through menopause-related health questions — a space with a lot of noise and very little reliable, personalized information.

## Status: Actively Rebuilding (v2)

This repo reflects an in-progress rebuild of the core architecture. v1 validated real demand (50+ onboarded users, 20+ user interviews) and surfaced specific limitations that v2 is built to address — see [What Changed](#what-changed-in-v2) below.

## What Phase Does

- Answers menopause-related health questions using a retrieval-augmented generation (RAG) pipeline grounded in vetted medical sources
- Flags queries that warrant clinical follow-up rather than an AI-generated answer, with explicit safety guardrails around sensitive health topics
- Prioritizes features based on real engagement signal from early users, not assumed demand

## v1 → v2: What Changed

v1 was built quickly using AI coding agents to validate demand fast. It proved people wanted this — but exposed [specific limitation, e.g. "retrieval accuracy degraded on ambiguous or multi-part queries" or "the guardrail logic was too rigid for nuanced clinical-adjacent questions"]. v2 is a rebuild of [the retrieval layer / guardrail system / etc.] to address that directly.

## Architecture (in progress)

- **Retrieval:** Pinecone
- **Generation:** Azure 
- **Safety layer:** Guardrails for clinical-adjacent queries, routing high-risk questions to a "consult a professional" flag rather than generating a direct answer
- **Stack:** TypeScript, React Native

## Why This Approach

Menopause-related health information is under-served and often unreliable online. Phase's goal isn't to replace medical care — it's to give people a trustworthy first stop that knows its own limits and routes people to real care when a question crosses that line.

## Roadmap

- [ ] Rebuild retrieval pipeline for multi-part/ambiguous queries
- [ ] Re-validate guardrail coverage against a wider set of edge cases
- [ ] Reintroduce onboarding flow from v1, updated for new architecture

---

*Built and maintained by Nour Assili. Reach out at nassilicontact@gmail.com or [linkedin.com/in/nourassili](https://linkedin.com/in/nourassili) with questions.*
