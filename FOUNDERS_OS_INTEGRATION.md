# Founder OS Integration Plan

Merge the agent UI from `founder-agents/test_ui.py` into this React app so
the Founder Command Center dashboard becomes the single place a founder
uses every day — Ring health, AI agents, CRM, drafts, all in one.

---

## What's being integrated

`test_ui.py` is a ~4000-line Python file that serves a complete single-page
app inline. It connects to `founder-agents-api.onrender.com` and covers:

- **Chat** — AI assistant with tool calls (prospecting, deal coach, draft outreach)
- **Contacts** — CRM list sourced from Apollo via the prospecting agent
- **Drafts** — Pending outreach emails for founder review and approval
- **Deals** — HubSpot pipeline view with deal coach output
- **Prospecting** — Run Apollo searches, HITL company/contact approval flow
- **Settings** — ICP config, seller context, SMTP for sending approved emails

The Ring dashboard already exists in this repo. This integration adds the
Founder OS layer on top of it under the same login.

---

## Two backends, one login

| Backend | URL | Used for |
|---|---|---|
| yati-api | `https://yati-api-7421.azurewebsites.net` | Ring data, user accounts, Stripe |
| founder-agents-api | `https://founder-agents-api.onrender.com` | CRM, AI agents, drafts |

Both use JWT. On login, call both backends and store two tokens:

```
localStorage.yati_token          ← existing, for yati-api
localStorage.founders_token      ← new, for founder-agents-api
```

The founder-agents `/auth/login` endpoint accepts `{ username, password }` and
returns `{ token, email }`. The same credentials work — it's the same founder
account. When yati-api login succeeds, immediately call founder-agents login
in the background and store the second token silently. The user sees one login,
gets both sessions.

---

## Local dev setup

### Option A — Frontend local, API on Render (recommended to start)

```bash
cd yativerseEarly
# add to .env.local:
# VITE_FOUNDERS_API_BASE=https://founder-agents-api.onrender.com
npm install && npm run dev
```

React runs at `localhost:5173`. Auth hits Azure, agent calls hit Render.
CORS on founder-agents-api is `*` so localhost requests work out of the box.

### Option B — Fully local (fastest iteration once set up)

```bash
# Terminal 1
cd founder-agents
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2
cd yativerseEarly
# VITE_FOUNDERS_API_BASE=http://localhost:8000
npm run dev
```

Requires a local `.env` in `founder-agents/` with `DATABASE_URL`,
`ANTHROPIC_API_KEY`, `APOLLO_API_KEY`, `JWT_SECRET`.

---

## New files to create

```
src/
  lib/
    foundersApi.js          ← API client for founder-agents-api (mirrors api.js)
  hooks/
    useSSEStream.js         ← custom hook for prospecting SSE stream
  pages/
    dashboard/
      Agents.jsx            ← Chat tab (main AI assistant)
      Contacts.jsx          ← CRM contacts list
      Drafts.jsx            ← Pending outreach drafts
      Deals.jsx             ← HubSpot pipeline
      Settings.jsx          ← ICP, SMTP, seller context
  components/
    dashboard/
      founders/
        ChatInterface.jsx         ← message list + input + tool call display
        SessionSidebar.jsx        ← chat history sidebar
        ContactsTable.jsx         ← sortable contact list
        DraftCard.jsx             ← single draft with approve/edit/reject
        ApprovalPanel.jsx         ← HITL panel: contact checkboxes + approve CTA
        CompanySelectionPanel.jsx ← HITL panel: company checkboxes + approve CTA
        ProspectingProgress.jsx   ← SSE stream progress display
        DealCard.jsx              ← deal health + coaching card
        ICPSettingsForm.jsx       ← ICP + seller context form
        SMTPSettingsForm.jsx      ← SMTP config form
```

---

## Files to modify

### `src/lib/api.js`
Add `loginFoundersOS(username, password)` that calls
`POST /api/v1/auth/login` on founder-agents-api and stores the token.
Call it inside the existing `login()` after yati-api auth succeeds.

### `src/components/dashboard/Sidebar.jsx`
Move "AI Agents" out of `DISABLED_ITEMS` into `LIVE_ITEMS`:

```js
{ icon: Bot,        label: "AI Agents",  to: "/dashboard/agents" },
{ icon: Users,      label: "Contacts",   to: "/dashboard/contacts" },
{ icon: Mail,       label: "Drafts",     to: "/dashboard/drafts" },
{ icon: TrendingUp, label: "Deals",      to: "/dashboard/deals" },
```

### `src/App.jsx`
Add four new `<Route>` entries under `RequireAuth`:

```jsx
<Route path="/dashboard/agents"   element={<RequireAuth><AgentsPage /></RequireAuth>} />
<Route path="/dashboard/contacts" element={<RequireAuth><ContactsPage /></RequireAuth>} />
<Route path="/dashboard/drafts"   element={<RequireAuth><DraftsPage /></RequireAuth>} />
<Route path="/dashboard/deals"    element={<RequireAuth><DealsPage /></RequireAuth>} />
```

### `.env.example`
Add:
```
VITE_FOUNDERS_API_BASE=https://founder-agents-api.onrender.com
```

---

## Phase breakdown

### Phase 1 — Auth bridge + scaffold (Day 1)

**Goal**: A founder can reach `/dashboard/agents` and see a placeholder page.
The founder-agents token is already in localStorage after login.

1. Add `VITE_FOUNDERS_API_BASE` to `.env.example` and `.env.local`
2. Create `src/lib/foundersApi.js` — base fetch wrapper with Bearer token,
   `getFoundersToken()` / `setFoundersToken()` / `clearFoundersToken()`
3. Add `loginFoundersOS()` call inside `login()` in `api.js`
4. Add `clearFoundersToken()` call inside `logout()` in `auth.jsx`
5. Create stub pages for Agents, Contacts, Drafts, Deals (one `<h1>` each)
6. Wire routes in `App.jsx` and nav items in `Sidebar.jsx`
7. Test locally: login → both tokens appear in localStorage → nav items visible

**Deliverable**: Skeleton routes working locally, auth bridge proven.

---

### Phase 2 — Static data pages (Days 2–3)

**Goal**: Contacts, Drafts, and Deals pages fully functional. No streaming,
just fetch + render.

**Contacts page**
- `GET /api/v1/contacts?limit=500` — list with name, title, company, score, source
- Filter bar: score (High/Medium/Low), search by name
- Row actions: "Generate Draft" button → `POST /api/v1/contacts/{id}/draft-outreach`
  shows a toast "Draft queued — check Drafts tab in ~60s"

**Drafts page**
- `GET /api/v1/approvals` — pending drafts
- `DraftCard.jsx` shows subject, body, contact name
- Actions: Approve (opens email client or sends via SMTP) / Edit / Reject
- Auto-polls every 30s or on tab focus to pick up new drafts

**Deals page**
- `GET /api/v1/deals` — list with stage, health, close date
- Health badge: Red/Yellow/Green from last Deal Coach run
- Row action: "Run Deal Coach" → `POST /api/v1/orchestrator/event`

**Key component**: `foundersApi.js` helper functions —
`listContacts()`, `listApprovals()`, `getApproval(draftId)`,
`approveApproval(draftId)`, `rejectApproval(draftId)`, `listDeals()`.

---

### Phase 3 — Chat + Prospecting (Days 4–6)

**Goal**: The AI Agents page is fully functional including streaming and HITL.

**`useSSEStream.js` hook**
```js
// Wraps EventSource with a state machine:
// idle → connecting → streaming → pending_approval | pending_company_selection | done | error
const { state, events, startStream } = useSSEStream(url, token)
```

**Chat interface**
- Session sidebar (load/create/delete via `/api/v1/sessions`)
- Message list with tool call cards (collapsible JSON, progress lines)
- Input bar with send on Enter
- When a `pending_approval` event arrives mid-stream, render `ApprovalPanel`
  inline in the chat — same HITL pattern as `test_ui.py`

**Prospecting panel** (accessible from chat or a dedicated "Run Prospecting" button)
- Calls `POST /api/v1/prospecting/stream` (SSE)
- Progress lines rendered live via `useSSEStream`
- On `pending_company_selection`: render `CompanySelectionPanel`
- On `pending_approval`: render `ApprovalPanel`
- On `done`: show summary card

**ApprovalPanel component**
```jsx
// contacts: [{id, name, title, company}]
// runId: string
// onApprove: (approvedIds) => void
// onSkip: () => void
<ApprovalPanel contacts={contacts} runId={runId} onApprove={...} onSkip={...} />
```
Calls `POST /api/v1/prospecting/approve` with selected IDs, shows
"Drafts queued — check Drafts tab" toast on success.

---

## Settings page (can be done in parallel with Phase 2)

Four sections, all via `GET/PATCH /api/v1/settings/icp` and `PATCH /api/v1/settings/smtp`:

1. **Seller context** — company name, product description, website URL
2. **ICP** — target industries, company sizes, pain keywords
3. **SMTP** — host, port, user, password, from address (for sending approved emails)
4. **Account** — email display, logout button

All plain controlled forms with a Save button per section. No streaming.

---

## Styling notes

- Use existing Tailwind config — `brand-bg`, `brand-bg2`, `brand-gold`, `white/5` etc.
- All new components should match the dark NOC aesthetic of the existing dashboard
- `DraftCard`, `ContactRow`, `DealCard` should use the same `border border-white/5
  bg-white/3 rounded-xl` card pattern as `AgentsLaunchCard` and `ComingSoonCard`
- Lucide icons already installed — use `Bot`, `Users`, `Mail`, `TrendingUp`,
  `Search`, `CheckCircle`, `XCircle`, `Send` for the new pages

---

## What `test_ui.py` becomes after this

Once all three phases are done and tested:
- Remove the `founder-agents-ui` service from `render.yaml`
- `test_ui.py` is no longer deployed — it stays in the repo as reference
- The Render UI service is replaced by the Vercel deployment of this app

The `founder-agents-api` service on Render stays unchanged — it's just
a backend that both the old and new UI talk to.

---

## Open questions before starting

1. **Shared credentials** — does the yativerseEarly login password match the
   `founder-agents` admin password (`ADMIN_PASSWORD` on Render)? If not, the
   auth bridge needs a mapping step or a shared secret flow.

2. **Vercel env vars** — `VITE_FOUNDERS_API_BASE` needs to be added in
   Vercel Project Settings → Environment Variables before production deploy.

3. **Settings page auth** — founder-agents settings are scoped by `owner_email`
   from the JWT. Confirm the email in the founder-agents token matches the email
   used during prospecting so contacts/drafts appear for the right user.
