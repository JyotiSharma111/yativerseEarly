# Founder Command Center — v1 (Ring only)

Adds `/login` and `/dashboard` to the marketing site, styled after the "Founder Command
Center" concept mockup (dark NOC-style layout, sidebar, card grid). Scoped deliberately
to only what's real today per the rollout plan: the Ring app's step/workout data. Every
other section from the concept (AI Agents, Venture Pulse, Priorities, Systems & Devices,
Privacy & Trust) renders as a visibly disabled "coming soon" card in the same grid — none
of it is faked or wired to fake data.

**This branch is built on top of `feature/order-page`, not `main`.** That branch already
adds `src/lib/api.js` with a real, working yati-api client (register/login/createOrder/
listOrders against `https://yati-api-7421.azurewebsites.net`), so this PR extends that
file with one more function (`fetchRingData`) instead of shipping a second, conflicting
API client. **Merge `feature/order-page` first.** `update/signal-ring-app-content` only
touches `src/pages/SignalRing.jsx` and doesn't overlap with either branch — safe to merge
whenever, in any order relative to these two.

## What's live vs. disabled

**Live (calls yati-api):** Steps card (today's steps vs. goal, 7-day history) and
Workouts card (recent workouts, device sync status) — both read from `GET /api/data`,
added to `src/lib/api.js` as `fetchRingData()`, mirroring `listOrders()`'s exact pattern
(same base URL, same Bearer token from `getToken()`, same error handling). Expected
response shape matches `UserData.dataJson` from `yati-api-table-storage-reference.md`:
`{ device, stepGoal, history, workouts }`.

**Disabled:** Priorities, AI Agents, Venture Pulse, Systems & Devices, Privacy & Trust —
each shown dimmed with a lock icon and the rollout-plan phase it belongs to, never real
or placeholder data.

## Login and demo mode

Login reuses `feature/order-page`'s existing `login()` — same account, same `Users`
table, same session (`yati_token` / `yati_email` in localStorage) as the storefront's
order flow. One login now works across `/order` and `/dashboard`.

There's also a "Continue with sample data" option on `/login` for demoing the dashboard
without a real account — it sets a `yati_demo_mode` flag (sessionStorage, clears when the
tab closes) and shows clearly-labeled sample data shaped exactly like a real sync payload
(`src/lib/sampleRingData.js`). If a real login's `GET /api/data` call fails for any reason,
the dashboard falls back to the same sample data with an honest "couldn't reach yati-api"
banner instead of breaking.

## What's unverified

`GET /api/data` itself — whether that route exists yet on the deployed Function App, and
whether its response is the bare `{ device, stepGoal, history, workouts }` object or
wrapped in an envelope — wasn't confirmed against a live call (no test account at hand
when this was written). Everything else in this PR (`login`, the token/session model, the
`/api/` prefix convention, the production URL) is the *same, already-proven* code from
`feature/order-page`, not a new guess. If `/api/data`'s shape turns out to differ, the fix
is entirely inside `fetchRingData()` in `src/lib/api.js` — nothing else in this PR touches
the network directly.

## Setup

`npm install && npm run dev`. No new env var needed — reuses `VITE_API_BASE` from
`feature/order-page`'s `.env.example`.

## Not done in this PR

Registration UI, password reset, and logout-everywhere aren't part of this PR — it only
covers login for an already-registered founder, same scope as the order page's login.
