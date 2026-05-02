'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Sparkles, ChevronDown, ChevronRight, Settings2 } from 'lucide-react'
import type { Task } from '@/lib/types'
import { getDaysLeft } from '@/lib/utils'
import { cn } from '@/lib/cn'
import PageWrapper from '@/components/Layout'

interface Props { tasks: Task[] }
type ModeId = 'focus' | 'short' | 'long' | 'custom'

const DEFAULT_MINS: Record<string, number> = { focus: 25, short: 5, long: 15 }

const BREAKDOWNS: Record<string, string[]> = {
  assignment: ['📖 Read the brief & understand requirements', '🔍 Research & gather sources', '✏️ Draft your response / solution', '🔁 Review & revise once', '📤 Submit & confirm upload'],
  exam:       ['📋 List all topics that could appear', '📖 Review notes for each topic', '🧪 Attempt past papers / practice Qs', '❌ Revisit weak areas', '😴 Rest well before the exam'],
  quiz:       ['📝 Skim lecture notes from the past week', '🔑 Identify key terms & formulas', '❓ Test yourself with flashcard-style Qs', '✅ Final quick review 15 min before'],
  lab:        ['📚 Read the lab manual / experiment sheet', '🔬 Run the experiment / collect data', '📊 Analyse results & plot graphs', '📝 Write observations & conclusion', '📤 Submit report'],
  project:    ['🗺️ Define scope & deliverables', '🏗️ Break into milestones', '💻 Build / write iteratively', '🔍 Test & gather feedback', '🎤 Prepare demo or submission'],
}

function pad(n: number) { return String(n).padStart(2, '0') }

async function fetchAIBreakdown(task: Task, apiKey: string): Promise<string[]> {
  const d = getDaysLeft(task.deadline)
  const urgency = d < 0 ? `${Math.abs(d)} days overdue` : d === 0 ? 'due TODAY' : `${d} days left`
  const prompt = `You are a study coach. Break down this specific task into exactly 5 actionable steps.

Task: "${task.title}"
Type: ${task.type}
Subject: ${task.subject || 'unknown'}
Marks: ${task.marks || 'unspecified'}
Deadline: ${urgency}
Notes: ${task.notes || 'none'}

Respond ONLY with a JSON array of 5 strings. No preamble, no markdown.
["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  const text = data.content?.[0]?.text ?? '[]'
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

export default function TimerPage({ tasks }: Props) {
  const pending = tasks.filter(t => !t.done).sort((a, b) =>
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  )

  // Timer state
  const [mode,        setMode]        = useState<ModeId>('focus')
  const [customMins,  setCustomMins]  = useState(45)
  const [customSecs,  setCustomSecs]  = useState(0)
  const [secs,        setSecs]        = useState(25 * 60)
  const [running,     setRunning]     = useState(false)
  const [sessions,    setSessions]    = useState(0)
  const [showCustom,  setShowCustom]  = useState(false)

  // Task state
  const [activeTask,  setActiveTask]  = useState<Task | null>(null)
  const [expanded,    setExpanded]    = useState<string | null>(null)
  const [aiSteps,     setAiSteps]     = useState<Record<string, string[]>>({})
  const [aiLoading,   setAiLoading]   = useState<string | null>(null)
  const [aiError,     setAiError]     = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSecs = mode === 'custom'
    ? customMins * 60 + customSecs
    : DEFAULT_MINS[mode] * 60

  const progress = totalSecs > 0 ? 1 - secs / totalSecs : 0
  const R = 80, CIR = 2 * Math.PI * R

  const modeColor: Record<ModeId, string> = {
    focus:  '#6366f1',
    short:  '#10b981',
    long:   '#3b82f6',
    custom: '#f59e0b',
  }

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setRunning(false)
  }, [])

  const start = useCallback(() => {
    setRunning(true)
    timerRef.current = setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!)
          setRunning(false)
          setSessions(n => n + 1)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])

  const reset = useCallback(() => {
    stop()
    setSecs(totalSecs)
  }, [stop, totalSecs])

  const switchMode = (m: ModeId) => {
    stop()
    setMode(m)
    if (m !== 'custom') setSecs(DEFAULT_MINS[m] * 60)
    else setSecs(customMins * 60 + customSecs)
  }

  const applyCustom = () => {
    const total = customMins * 60 + customSecs
    if (total < 60) return
    stop()
    setMode('custom')
    setSecs(total)
    setShowCustom(false)
  }

  useEffect(() => () => stop(), [stop])

  const getApiKey = () => { try { return localStorage.getItem('amic_apikey') ?? '' } catch { return '' } }

  const handleAI = async (task: Task) => {
    const key = getApiKey()
    if (!key) { setAiError('No API key found — go to ⚙️ Settings and paste your Anthropic key first.'); return }
    setAiError(null)
    setAiLoading(task.id)
    try {
      const steps = await fetchAIBreakdown(task, key)
      setAiSteps(prev => ({ ...prev, [task.id]: steps }))
    } catch {
      setAiError('Request failed — double-check your API key in Settings.')
    } finally {
      setAiLoading(null)
    }
  }

  const col = modeColor[mode]

  const MODES: { id: ModeId; label: string }[] = [
    { id: 'focus',  label: 'Focus'       },
    { id: 'short',  label: 'Short break' },
    { id: 'long',   label: 'Long break'  },
    { id: 'custom', label: 'Custom'      },
  ]

  return (
    <PageWrapper maxWidth={1100}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Study Timer</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Set your session length, pick a task, and stay focused.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Timer card ── */}
        <div className="card p-6 flex flex-col items-center gap-5">

          {/* Mode tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-full border-2 border-slate-200">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => m.id === 'custom' ? setShowCustom(s => !s) : switchMode(m.id)}
                className={cn(
                  'flex-1 px-2 py-1.5 rounded-md text-xs font-bold transition-colors',
                  mode === m.id
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {m.id === 'custom' ? <Settings2 size={12} className="inline mr-1" /> : null}
                {m.label}
              </button>
            ))}
          </div>

          {/* Custom time picker */}
          {showCustom && (
            <div className="w-full rounded-xl border-2 border-amber-300 bg-amber-50 p-4 space-y-3">
              <p className="text-xs font-bold text-amber-800">Set your own timer</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="label text-amber-700">Minutes</label>
                  <input
                    type="number" min={0} max={180}
                    value={customMins}
                    onChange={e => setCustomMins(Number(e.target.value))}
                    className="input text-center text-lg font-bold border-amber-300 focus:border-amber-500"
                  />
                </div>
                <span className="text-2xl font-bold text-amber-600 mt-4">:</span>
                <div className="flex-1">
                  <label className="label text-amber-700">Seconds</label>
                  <input
                    type="number" min={0} max={59}
                    value={customSecs}
                    onChange={e => setCustomSecs(Number(e.target.value))}
                    className="input text-center text-lg font-bold border-amber-300 focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCustom(false)} className="btn-secondary flex-1 py-1.5 text-xs">Cancel</button>
                <button
                  onClick={applyCustom}
                  disabled={customMins * 60 + customSecs < 60}
                  className="btn-primary flex-1 py-1.5 text-xs"
                  style={{ background: '#f59e0b' }}
                >
                  Set timer
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[15, 30, 45, 60, 90].map(m => (
                  <button
                    key={m}
                    onClick={() => { setCustomMins(m); setCustomSecs(0) }}
                    className="px-2.5 py-1 rounded-lg border-2 border-amber-300 bg-white text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ring */}
          <div className="relative w-48 h-48">
            <svg width="192" height="192" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="96" cy="96" r={R} fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                cx="96" cy="96" r={R}
                fill="none"
                stroke={col}
                strokeWidth="10"
                strokeDasharray={CIR}
                strokeDashoffset={CIR * (1 - progress)}
                strokeLinecap="round"
                style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-4xl font-bold text-slate-900 tabular-nums tracking-tight">
                {pad(Math.floor(secs / 60))}:{pad(secs % 60)}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: col }}>
                {MODES.find(m => m.id === mode)?.label}
              </span>
              {mode === 'custom' && (
                <span className="text-xs text-slate-400">{customMins}m {customSecs}s session</span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button onClick={reset} className="btn-secondary px-4 py-2">
              <RotateCcw size={14} /> Reset
            </button>
            <button
              onClick={running ? stop : start}
              disabled={totalSecs === 0}
              className="inline-flex items-center gap-2 rounded-lg px-7 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
              style={{ background: col }}
            >
              {running
                ? <><Pause size={14} /> Pause</>
                : <><Play  size={14} /> {secs === totalSecs ? 'Start' : 'Resume'}</>
              }
            </button>
          </div>

          {/* Session dots */}
          <div className="flex items-center gap-2">
            {[0,1,2,3].map(i => (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-colors border-2"
                style={{
                  background: i < (sessions % 4) ? col : 'transparent',
                  borderColor: i < (sessions % 4) ? col : '#cbd5e1',
                }}
              />
            ))}
            <span className="text-xs font-semibold text-slate-500 ml-1">
              {sessions} session{sessions !== 1 ? 's' : ''} done
            </span>
          </div>

          {/* Active task */}
          {activeTask && (
            <div className="w-full rounded-xl border-2 border-indigo-300 bg-indigo-50 px-4 py-3">
              <p className="text-xs font-bold text-indigo-600 mb-0.5">Currently studying</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{activeTask.title}</p>
              <button onClick={() => setActiveTask(null)} className="text-xs text-slate-400 hover:text-slate-600 mt-1 font-medium">
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Task picker ── */}
        <div className="card flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-slate-200">
            <h2 className="font-semibold text-slate-900">Pick a task</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Select what you're working on this session.</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y-2 divide-slate-100" style={{ maxHeight: 360 }}>
            {!pending.length && (
              <p className="text-center text-sm text-slate-400 py-10 font-medium">No pending tasks 🎉</p>
            )}
            {pending.map(t => {
              const d        = getDaysLeft(t.deadline)
              const isActive = activeTask?.id === t.id
              const urgCls   = d < 0 ? 'text-red-700' : d <= 3 ? 'text-amber-700' : d <= 7 ? 'text-indigo-700' : 'text-emerald-700'
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTask(isActive ? null : t)}
                  className={cn(
                    'w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50',
                    isActive && 'bg-indigo-50'
                  )}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                    style={{
                      borderColor:     isActive ? col : '#cbd5e1',
                      backgroundColor: isActive ? col : 'transparent',
                    }}
                  >
                    {isActive && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.title}</p>
                    <p className="text-xs font-medium text-slate-500">{t.subject || '—'}{t.marks ? ` · ${t.marks}m` : ''}</p>
                  </div>
                  <span className={cn('text-xs font-bold flex-shrink-0', urgCls)}>
                    {d < 0 ? `${Math.abs(d)}d over` : d === 0 ? 'TODAY' : `${d}d`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── AI Breakdowns ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-label">Step-by-step breakdowns</h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-100 border-2 border-purple-300 rounded-full px-3 py-1">
            <Sparkles size={11} /> AI-powered
          </span>
        </div>

        {aiError && (
          <div className="mb-4 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {aiError}
          </div>
        )}

        {!pending.length && (
          <div className="card py-10 text-center text-sm text-slate-500 font-medium">
            Nothing pending — you're all caught up! 🎉
          </div>
        )}

        <div className="space-y-2">
          {pending.map(t => {
            const steps   = aiSteps[t.id] ?? BREAKDOWNS[t.type] ?? BREAKDOWNS.assignment
            const isAI    = !!aiSteps[t.id]
            const loading = aiLoading === t.id
            const d       = getDaysLeft(t.deadline)
            const open    = expanded === t.id
            const badgeCls = d < 0 ? 'badge-red' : d <= 3 ? 'badge-amber' : 'badge-indigo'

            return (
              <div key={t.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpanded(open ? null : t.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{t.title}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {t.subject || '—'}{t.marks ? ` · ${t.marks} marks` : ''}
                    </p>
                  </div>
                  <span className={cn('badge flex-shrink-0', badgeCls)}>
                    {d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Today' : `${d}d left`}
                  </span>
                  {open
                    ? <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                    : <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
                  }
                </button>

                {open && (
                  <div className="border-t-2 border-slate-200 px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        {isAI ? '✨ AI-generated plan' : `Default plan for ${t.type}`}
                      </span>
                      <button
                        onClick={() => handleAI(t)}
                        disabled={loading}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border-2 transition-colors',
                          loading
                            ? 'border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50'
                            : isAI
                            ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                            : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        )}
                      >
                        <Sparkles size={11} />
                        {loading ? 'Thinking…' : isAI ? 'Regenerate' : 'AI breakdown'}
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border-2',
                            isAI
                              ? 'bg-purple-100 text-purple-700 border-purple-300'
                              : 'bg-indigo-100 text-indigo-700 border-indigo-300'
                          )}>{i + 1}</span>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
                      💡 Pick this task above and work through one step per timer session.
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </PageWrapper>
  )
}
