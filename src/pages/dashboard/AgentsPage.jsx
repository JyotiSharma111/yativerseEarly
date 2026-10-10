import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Plus, Trash2, Send, Bot, User, Zap, CheckCircle,
  XCircle, AlertCircle, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react'
import Sidebar from '../../components/dashboard/Sidebar'
import { useAuth } from '../../lib/auth'
import { getEntitlements } from '../../lib/api'
import {
  getFoundersToken,
  listSessions, getChatSession, saveSession, deleteSession,
  sendMessage, approveProspecting,
} from '../../lib/foundersApi'
import { useSSEStream } from '../../hooks/useSSEStream'

const FOUNDERS_API_BASE =
  import.meta.env.VITE_FOUNDERS_API_BASE || 'https://founder-agents-api.onrender.com'

// ---------------------------------------------------------------------------
// Sample data for demo mode
// ---------------------------------------------------------------------------
const DEMO_SESSIONS = [
  { id: 'demo-1', title: 'Logistics outreach strategy', message_count: 4 },
  { id: 'demo-2', title: 'Find VP Ops leads in logistics', message_count: 6 },
]

const DEMO_MESSAGES = {
  'demo-1': [
    { role: 'user',      content: 'What deals need attention this week?' },
    { role: 'assistant', content: 'Based on your HubSpot pipeline: LogiSync has been in Negotiation for 14 days without activity — that\'s the highest risk. Priority Logistics is in Proposal Sent with a close date in 6 weeks, looking healthy.' },
    { role: 'user',      content: 'Draft a follow-up for LogiSync' },
    { role: 'assistant', content: 'Queued a follow-up draft for LogiSync — check the Drafts tab in ~60 seconds once it\'s generated.' },
  ],
  'demo-2': [
    { role: 'user',      content: 'Find VP-level ops contacts at logistics firms' },
    { role: 'assistant', content: 'Running prospecting for VP Operations contacts at logistics companies. I\'ll search Apollo for matching profiles and score them against your ICP.' },
    { role: 'user',      content: 'How many contacts did we find?' },
    { role: 'assistant', content: 'Found 5 contacts — 2 scored High, 2 Medium, 1 Low. The High-score leads are Iqbal Khan (CEO/COO, Priority Logistics) and Sarah Chen (VP Operations, FleetTrack Pro). Both match your ICP on industry, company size, and seniority.' },
    { role: 'user',      content: 'Generate outreach for the high-score ones' },
    { role: 'assistant', content: 'Outreach drafts queued for Iqbal Khan and Sarah Chen. Head to the Drafts tab to review and approve before sending.' },
  ],
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SessionSidebar({ sessions, activeId, onSelect, onNew, onDelete, loading }) {
  return (
    <div className="flex w-56 shrink-0 flex-col border-r border-white/5 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/30">Chats</span>
        <button
          onClick={onNew}
          className="rounded-lg p-1 text-white/30 transition hover:bg-white/10 hover:text-white"
          title="New chat"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="px-3 py-2 text-xs text-white/20">Loading…</div>
        ) : sessions.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-white/20">No chats yet</div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`group flex cursor-pointer items-center justify-between gap-2 px-3 py-2.5 transition ${
                s.id === activeId ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <span className="min-w-0 truncate text-xs">{s.title || 'New Chat'}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
                className="shrink-0 opacity-0 transition group-hover:opacity-100 hover:text-rose-400"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
        isUser ? 'bg-brand-purple/30 text-brand-purple' : 'bg-white/10 text-white/60'
      }`}>
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-purple/20 text-white'
            : 'border border-white/5 bg-white/[0.04] text-white/80'
        }`}>
          {msg.content}
        </div>
        {msg.tool_calls && msg.tool_calls.length > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50"
          >
            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {msg.tool_calls.length} tool call{msg.tool_calls.length > 1 ? 's' : ''}
          </button>
        )}
        {expanded && msg.tool_calls && (
          <pre className="max-w-sm overflow-auto rounded-xl border border-white/5 bg-black/30 p-3 text-[10px] text-white/40">
            {JSON.stringify(msg.tool_calls, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

function ProspectingPanel({ onStart, streaming }) {
  const [instruction, setInstruction] = useState('')
  const [open, setOpen] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    onStart(instruction.trim() || 'Find ICP leads based on my settings')
    setInstruction('')
    setOpen(false)
  }

  return (
    <div className="border-t border-white/5 px-4 py-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          disabled={streaming}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-white/50 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Zap size={13} />
          Run Prospecting
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            autoFocus
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. VP Ops at logistics firms, 50-200 employees…"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-white/20"
          />
          <button
            type="submit"
            className="rounded-xl border border-brand-purple/30 bg-brand-purple/20 px-3 py-2 text-xs font-medium text-white transition hover:bg-brand-purple/30"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/40 hover:text-white"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  )
}

function StreamProgress({ events, state, error }) {
  if (state === 'idle') return null
  return (
    <div className="mx-4 my-2 rounded-xl border border-white/5 bg-black/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/50">
        {state === 'connecting' || state === 'streaming' ? (
          <Loader2 size={12} className="animate-spin" />
        ) : state === 'error' ? (
          <AlertCircle size={12} className="text-rose-400" />
        ) : (
          <CheckCircle size={12} className="text-emerald-400" />
        )}
        Prospecting {state === 'connecting' ? 'connecting…' : state === 'streaming' ? 'running…' : state}
      </div>
      <div className="flex flex-col gap-1">
        {events.map((ev, i) => (
          <div key={i} className="text-xs text-white/40">
            {ev.type === 'step'    && `→ ${ev.step}${ev.detail ? `: ${ev.detail}` : ''}`}
            {ev.type === 'contact' && `✓ ${ev.name} — ${ev.score}`}
            {ev.type === 'done'    && `Done — ${ev.result?.contacts_saved ?? 0} contacts saved`}
          </div>
        ))}
        {error && <div className="text-xs text-rose-400">{error}</div>}
      </div>
    </div>
  )
}

function ApprovalPanel({ hitlData, onApprove, onSkip }) {
  const contacts = hitlData?.pending_contacts ?? []
  const [selected, setSelected] = useState(() => new Set(contacts.map((c) => c.id)))

  function toggle(id) {
    setSelected((s) => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="mx-4 my-2 rounded-xl border border-brand-gold/20 bg-brand-gold/5 p-4">
      <p className="mb-3 text-xs font-semibold text-brand-gold2">
        {contacts.length} contact{contacts.length !== 1 ? 's' : ''} found — approve for outreach
      </p>
      <div className="mb-4 flex flex-col gap-2">
        {contacts.map((c) => (
          <label key={c.id} className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={selected.has(c.id)}
              onChange={() => toggle(c.id)}
              className="accent-brand-gold"
            />
            <span className="text-xs text-white/70">
              <span className="font-medium text-white">{c.name}</span>
              {(c.title || c.company) && (
                <span className="text-white/40"> — {[c.title, c.company].filter(Boolean).join(' / ')}</span>
              )}
            </span>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(hitlData.run_id, [...selected])}
          disabled={selected.size === 0}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-40"
        >
          <CheckCircle size={12} />
          Approve {selected.size > 0 ? `(${selected.size})` : ''}
        </button>
        <button
          onClick={onSkip}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 hover:text-white"
        >
          Skip all
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AgentsPage() {
  const { email, demo, logout } = useAuth()
  const [entitlements, setEntitlements] = useState(null)

  // Sessions
  const [sessions, setSessions]       = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [activeSessionId, setActiveSessionId] = useState(null)

  // Messages
  const [messages, setMessages]       = useState([])
  const [input, setInput]             = useState('')
  const [sending, setSending]         = useState(false)

  // Toast
  const [toast, setToast]             = useState(null)

  // Prospecting SSE
  const { state: sseState, events: sseEvents, hitlData, error: sseError, startStream, reset: resetSSE } = useSSEStream()

  const messagesEndRef = useRef(null)
  const msgCacheRef = useRef({})  // sessionId → messages[], preserves state across switches

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sseState])

  // Load entitlements
  useEffect(() => {
    if (demo) { setEntitlements({ planName: 'Founder', status: 'trial' }); return }
    getEntitlements().then(setEntitlements).catch(() => setEntitlements(null))
  }, [demo])

  // Load sessions
  useEffect(() => {
    if (demo) {
      // Pre-populate cache with demo messages so switching works offline
      msgCacheRef.current = { ...DEMO_MESSAGES }
      setSessions(DEMO_SESSIONS)
      setMessages(DEMO_MESSAGES['demo-1'])
      setActiveSessionId(DEMO_SESSIONS[0].id)
      setSessionsLoading(false)
      return
    }
    listSessions()
      .then((data) => {
        const list = data.sessions ?? []
        setSessions(list)
        if (list.length > 0) loadSession(list[0].id)
        else setSessionsLoading(false)
      })
      .catch(() => setSessionsLoading(false))
  }, [demo])

  async function loadSession(id) {
    // Save current session messages to cache before switching
    if (activeSessionId) {
      msgCacheRef.current[activeSessionId] = messages
    }

    // Serve from cache instantly if available
    if (msgCacheRef.current[id]) {
      setMessages(msgCacheRef.current[id])
      setActiveSessionId(id)
      resetSSE()
      return
    }

    // Otherwise fetch from API
    setSessionsLoading(true)
    try {
      const data = await getChatSession(id)
      const fetched = data.messages ?? []
      msgCacheRef.current[id] = fetched
      setMessages(fetched)
      setActiveSessionId(id)
    } catch {
      setMessages([])
      setActiveSessionId(id)
    } finally {
      setSessionsLoading(false)
    }
    resetSSE()
  }

  function handleNewChat() {
    setActiveSessionId(null)
    setMessages([])
    resetSSE()
  }

  async function handleDeleteSession(id) {
    if (demo) return
    await deleteSession(id).catch(() => {})
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSessionId === id) handleNewChat()
  }

  // Send a chat message
  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || demo) return

    const userMsg = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setSending(true)

    try {
      const result = await sendMessage(text)
      const assistantContent = typeof result === 'string' ? result
        : result.summary ?? result.action ?? result.message ?? JSON.stringify(result)
      const assistantMsg = { role: 'assistant', content: assistantContent }
      const finalMessages = [...nextMessages, assistantMsg]
      setMessages(finalMessages)

      // Save session and keep cache in sync
      const saved = await saveSession(activeSessionId, finalMessages)
      const sid = activeSessionId || saved.session_id
      msgCacheRef.current[sid] = finalMessages
      if (!activeSessionId) {
        setActiveSessionId(saved.session_id)
        setSessions((prev) => [{ id: saved.session_id, title: saved.title, message_count: finalMessages.length }, ...prev])
      }
    } catch (err) {
      showToast(err.message || 'Failed to send', 'error')
      setMessages(nextMessages.slice(0, -1))
    } finally {
      setSending(false)
    }
  }

  // Start prospecting SSE stream
  async function handleStartProspecting(instruction) {
    if (demo) { showToast('Sign in to run prospecting', 'error'); return }
    const token = getFoundersToken()
    await startStream(
      `${FOUNDERS_API_BASE}/api/v1/prospecting/stream`,
      { instruction },
      token,
    )
  }

  // HITL approve
  async function handleApprove(runId, approvedIds) {
    try {
      const res = await approveProspecting(runId, approvedIds)
      showToast(res.message || `${approvedIds.length} contacts queued`, 'success')
      resetSSE()
    } catch (err) {
      showToast(err.message || 'Approval failed', 'error')
    }
  }

  function showToast(message, type) {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const isStreaming = sseState === 'connecting' || sseState === 'streaming'

  return (
    <div className="flex min-h-screen bg-brand-bg font-body text-white">
      <Sidebar onLogout={logout} planLabel={entitlements?.planName} planStatus={entitlements?.status} />

      {/* Agents content area */}
      <div className="flex flex-1 overflow-hidden" style={{ height: '100vh' }}>
        {/* Session sidebar */}
        <SessionSidebar
          sessions={sessions}
          activeId={activeSessionId}
          onSelect={loadSession}
          onNew={handleNewChat}
          onDelete={handleDeleteSession}
          loading={sessionsLoading && sessions.length === 0}
        />

        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center border-b border-white/5 px-5 py-3">
            <Bot size={16} className="mr-2 text-white/30" />
            <span className="text-sm font-semibold text-white/70">AI Agents</span>
            {demo && <span className="ml-3 text-xs text-white/25">· sample data</span>}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {messages.length === 0 && sseState === 'idle' ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <Bot size={32} className="text-white/15" />
                <p className="text-sm text-white/30">Ask anything or run prospecting to find new leads.</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {['What deals need attention?', 'Summarise my pipeline', 'Find VP Ops leads in logistics'].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s) }}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 transition hover:border-white/20 hover:text-white/70"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}
                {sending && (
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                      <Loader2 size={13} className="animate-spin text-white/40" />
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-2.5 text-sm text-white/30">
                      Thinking…
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* SSE progress */}
          {sseState !== 'idle' && (
            <StreamProgress events={sseEvents} state={sseState} error={sseError} />
          )}

          {/* HITL approval panel */}
          {sseState === 'pending_approval' && hitlData && (
            <ApprovalPanel
              hitlData={hitlData}
              onApprove={handleApprove}
              onSkip={resetSSE}
            />
          )}

          {/* Company selection panel — simplified for now */}
          {sseState === 'pending_company_selection' && hitlData && (
            <div className="mx-4 my-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/50">
              Company selection panel — {hitlData.companies?.length ?? 0} companies found.
              <button onClick={resetSSE} className="ml-3 text-white/40 underline hover:text-white">Dismiss</button>
            </div>
          )}

          {/* Prospecting launcher */}
          <ProspectingPanel onStart={handleStartProspecting} streaming={isStreaming} />

          {/* Chat input */}
          <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-white/5 px-4 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={demo ? 'Sign in to chat with AI agents…' : 'Ask anything…'}
              disabled={demo || sending}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || demo}
              className="flex items-center justify-center rounded-xl border border-white/10 p-2.5 text-white/50 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
          toast.type === 'success'
            ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
            : 'border-brand-rose/25 bg-brand-rose/10 text-brand-rose'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.message}
        </div>
      )}
    </div>
  )
}
