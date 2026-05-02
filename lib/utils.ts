import type { Task, Urgency } from './types'

export const getDaysLeft = (deadline: string): number => {
  const now = new Date(); now.setHours(0,0,0,0)
  const d   = new Date(deadline); d.setHours(0,0,0,0)
  return Math.round((d.getTime() - now.getTime()) / 86400000)
}

export const getUrgency = (task: Task): Urgency => {
  if (task.done) return 'done'
  const d = getDaysLeft(task.deadline)
  if (d < 0)  return 'overdue'
  if (d <= 3) return 'urgent'
  if (d <= 7) return 'soon'
  return 'ok'
}

export const getCookedScore = (tasks: Task[]): number => {
  const pending = tasks.filter(t => !t.done)
  if (!pending.length) return 0
  let score = 0, max = 0
  pending.forEach(t => {
    const d = getDaysLeft(t.deadline), m = t.marks || 10
    max += m * 3
    if      (d < 0)  score += m * 3
    else if (d === 0) score += m * 2
    else if (d <= 2)  score += m * 1.7
    else if (d <= 5)  score += m * 1.1
    else              score += m * 0.3
  })
  return Math.min(98, Math.round((score / max) * 100))
}

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

export const SUBJECT_COLORS: Record<string, string> = {
  OS: '#c0a0ff', DBMS: '#ffd060', MATHS: '#60c8ff', MATH: '#60c8ff',
  CN: '#ff80c0', DSA: '#40e0a0', SE: '#80d8ff',
}
export const subColor = (s: string) =>
  SUBJECT_COLORS[s?.toUpperCase()] ?? '#9898b8'

export const TYPE_EMOJI: Record<string, string> = {
  assignment: '📝', exam: '📖', quiz: '❓', lab: '🔬', project: '💡',
}

export const URGENCY_COLOR: Record<string, string> = {
  overdue: 'var(--red)',
  urgent:  'var(--ember)',
  soon:    'var(--blue)',
  ok:      'var(--green)',
  done:    'var(--text3)',
}

export const ls = {
  get: <T>(key: string, def: T): T => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def } catch { return def }
  },
  set: <T>(key: string, val: T) => {
    try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
  },
}
