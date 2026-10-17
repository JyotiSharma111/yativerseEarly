/**
 * ChatContext — all chat state lives here, above the router.
 *
 * Because this provider never unmounts (it wraps the whole app), the SSE
 * stream, messages, and session list survive navigation between dashboard pages.
 * AgentsPage is a pure UI shell that reads from useChatContext().
 */
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './auth'
import { getFreshToken } from './api'
import {
  listSessions, getChatSession, saveSession, deleteSession, approveProspecting,
} from './foundersApi'
import { useSSEStream } from '../hooks/useSSEStream'

const FOUNDERS_API_BASE =
  import.meta.env.VITE_FOUNDERS_API_BASE || 'https://founder-agents-api.onrender.com'

const DEMO_SESSIONS = [
  { id: 'demo-1', title: 'Logistics outreach strategy' },
  { id: 'demo-2', title: 'Find VP Ops leads in logistics' },
]

const DEMO_MESSAGES = {
  'demo-1': [
    { role: 'user',      content: 'What deals need attention this week?' },
    { role: 'assistant', content: "Based on your HubSpot pipeline: LogiSync has been in Negotiation for 14 days without activity — that's the highest risk. Priority Logistics is in Proposal Sent with a close date in 6 weeks, looking healthy." },
    { role: 'user',      content: 'Draft a follow-up for LogiSync' },
    { role: 'assistant', content: 'Queued a follow-up draft for LogiSync — check the Drafts tab in ~60 seconds once it\'s generated.' },
  ],
  'demo-2': [
    { role: 'user',      content: 'Find VP-level ops contacts at logistics firms' },
    { role: 'assistant', content: "Running prospecting for VP Operations contacts at logistics companies. I'll search Apollo for matching profiles and score them against your ICP." },
    { role: 'user',      content: 'How many contacts did we find?' },
    { role: 'assistant', content: 'Found 5 contacts — 2 scored High, 2 Medium, 1 Low. The High-score leads are Iqbal Khan (CEO/COO, Priority Logistics) and Sarah Chen (VP Operations, FleetTrack Pro).' },
    { role: 'user',      content: 'Generate outreach for the high-score ones' },
    { role: 'assistant', content: 'Outreach drafts queued for Iqbal Khan and Sarah Chen. Head to the Drafts tab to review and approve before sending.' },
  ],
}

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { demo } = useAuth()

  const [sessions, setSessions]               = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages]               = useState([])
  const [sending, setSending]                 = useState(false)
  const [toast, setToast]                     = useState(null)

  const { state: sseState, events: sseEvents, hitlData, error: sseError, startStream, reset: resetSSE } = useSSEStream()

  const msgCacheRef        = useRef({})
  const pendingSessionIdRef = useRef(null)
  const pendingMessagesRef  = useRef(null)

  // ── Load sessions ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (demo) {
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
        if (list.length > 0) _loadSession(list[0].id)
        else setSessionsLoading(false)
      })
      .catch(() => setSessionsLoading(false))
  }, [demo]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── SSE state machine → update messages / save on completion ──────────────
  useEffect(() => {
    if (sseState === 'connecting' || sseState === 'streaming') {
      pendingMessagesRef.current = messages.filter(m => m.role !== '__typing__')
    }
    if (sseState === 'done') {
      const doneEvent = sseEvents.find(ev => ev.type === 'done')
      const result = doneEvent?.result
      const assistantContent = result?.reply
        ?? result?.reasoning
        ?? (result?.skipped ? "I'm here to help with your pipeline. Try asking me to find leads, coach a deal, or draft outreach." : null)
        ?? 'Done.'

      const base = pendingMessagesRef.current ?? messages.filter(m => m.role !== '__typing__')
      const finalMessages = [...base, { role: 'assistant', content: assistantContent }]
      setMessages(finalMessages)
      setSending(false)

      const knownSessionId = activeSessionId || pendingSessionIdRef.current
      saveSession(knownSessionId, finalMessages).then(saved => {
        const sid = knownSessionId || saved.session_id
        msgCacheRef.current[sid] = finalMessages
        if (!knownSessionId) {
          setActiveSessionId(saved.session_id)
          setSessions(prev => [{ id: saved.session_id, title: saved.title }, ...prev])
        }
      }).catch(() => {})
    }
    if (sseState === 'error') {
      _showToast(sseError || 'Stream error', 'error')
      setMessages(prev => prev.filter(m => m.role !== '__typing__'))
      setSending(false)
    }
  }, [sseState]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function _loadSession(id) {
    if (activeSessionId) {
      msgCacheRef.current[activeSessionId] = messages
    }
    if (msgCacheRef.current[id]) {
      setMessages(msgCacheRef.current[id])
      setActiveSessionId(id)
      resetSSE()
      return
    }
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
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeSessionId === id) handleNewChat()
  }

  async function handleSend(text) {
    if (!text || sending || demo) return

    const userMsg = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setSending(true)

    // Await save for both new and existing sessions — ensures message is in DB
    // before the stream starts so navigating away mid-stream never loses it.
    if (!activeSessionId) {
      try {
        const saved = await saveSession(null, nextMessages)
        if (saved?.session_id) {
          pendingSessionIdRef.current = saved.session_id
          setActiveSessionId(saved.session_id)
          setSessions(prev => [{ id: saved.session_id, title: saved.title }, ...prev])
        }
      } catch {}
    } else {
      await saveSession(activeSessionId, nextMessages).catch(() => {})
    }

    try {
      const token = await getFreshToken()
      await startStream(
        `${FOUNDERS_API_BASE}/api/v1/orchestrator/stream`,
        { message: text, history: messages.filter(m => m.role !== '__typing__') },
        token,
      )
    } catch (err) {
      _showToast(err.message || 'Failed to send', 'error')
      setMessages(nextMessages.slice(0, -1))
      setSending(false)
    }
  }

  async function handleStartProspecting(instruction) {
    if (demo) { _showToast('Sign in to run prospecting', 'error'); return }
    const token = await getFreshToken()
    await startStream(
      `${FOUNDERS_API_BASE}/api/v1/prospecting/stream`,
      { instruction },
      token,
    )
  }

  async function handleApprove(runId, approvedIds) {
    try {
      const res = await approveProspecting(runId, approvedIds)
      _showToast(res.message || `${approvedIds.length} contacts queued`, 'success')
      resetSSE()
    } catch (err) {
      _showToast(err.message || 'Approval failed', 'error')
    }
  }

  function _showToast(message, type) {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <ChatContext.Provider value={{
      sessions,
      sessionsLoading,
      activeSessionId,
      messages,
      sending,
      sseState,
      sseEvents,
      hitlData,
      sseError,
      toast,
      loadSession: _loadSession,
      handleNewChat,
      handleDeleteSession,
      handleSend,
      handleStartProspecting,
      handleApprove,
      showToast: _showToast,
      resetSSE,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used inside ChatProvider')
  return ctx
}
