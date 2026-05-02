'use client'
import { useState, useMemo, useEffect } from 'react'
import { AlertTriangle, Clock, TrendingUp, BookOpen, Plus, Check, Trash2, Calendar, BarChart2, Timer, Flame } from 'lucide-react'
import type { Task, Page } from '@/lib/types'
import { getDaysLeft, getCookedScore, fmtDate } from '@/lib/utils'
import AddTaskModal from '@/components/ui/AddTaskModal'
import NotifBanner  from '@/components/ui/NotifBanner'
import PageWrapper  from '@/components/Layout'
import { cn } from '@/lib/cn'

interface Props {
  tasks: Task[]; addTask: (t: Task) => void
  toggleTask: (id: string) => void; deleteTask: (id: string) => void
  toast: (msg: string) => void; setPage?: (p: Page) => void
}

type Filter = 'all' | 'urgent' | 'exams' | 'done'

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}

function getMiniCalendar(tasks: Task[]) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const key = d.toISOString().split('T')[0]
    const dayTasks = tasks.filter(t => !t.done && t.deadline?.startsWith(key))
    return {
      label: i === 0 ? 'Today' : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
      date: d.getDate(),
      tasks: dayTasks,
      isToday: i === 0,
    }
  })
}

export default function DashboardPage({ tasks, addTask, toggleTask, deleteTask, toast, setPage }: Props) {
  const [filter,    setFilter]    = useState<Filter>('all')
  const [showAdd,   setShowAdd]   = useState(false)
  const [showNotif, setShowNotif] = useState(true)

  useEffect(() => {
    const h = () => setShowAdd(true)
    document.addEventListener('open-add-task', h)
    return () => document.removeEventListener('open-add-task', h)
  }, [])

  const pending    = tasks.filter(t => !t.done)
  const done       = tasks.filter(t => t.done)
  const overdue    = pending.filter(t => getDaysLeft(t.deadline) < 0)
  const thisWeek   = pending.filter(t => { const d = getDaysLeft(t.deadline); return d >= 0 && d <= 7 })
  const totalMarks = pending.reduce((a, t) => a + (t.marks || 0), 0)
  const score      = getCookedScore(tasks)
  const miniCal    = getMiniCalendar(tasks)

  const filtered = useMemo(() => {
    let list = [...tasks]
    if      (filter === 'urgent') list = list.filter(t => !t.done && getDaysLeft(t.deadline) <= 3)
    else if (filter === 'exams')  list = list.filter(t => t.type === 'exam')
    else if (filter === 'done')   list = list.filter(t => t.done)
    else                          list = list.filter(t => !t.done)
    return list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }, [tasks, filter])

  const priorities = useMemo(() => [...pending].sort((a, b) => {
    const da = getDaysLeft(a.deadline), db = getDaysLeft(b.deadline)
    return (db < 0 ? (b.marks||10)*1000 : (b.marks||10)/(db+0.5)) - (da < 0 ? (a.marks||10)*1000 : (a.marks||10)/(da+0.5))
  }).slice(0, 3), [pending])

  const scoreLabel = score < 25 ? 'Chill' : score < 50 ? 'Shaky' : score < 75 ? 'Borderline' : 'Cooked 🔥'
  const scoreColor = score < 25 ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
                   : score < 50 ? 'text-amber-700 bg-amber-100 border-amber-300'
                   : score < 75 ? 'text-orange-700 bg-orange-100 border-orange-300'
                   : 'text-red-700 bg-red-100 border-red-300'
  const verdict = score < 25 ? "You're in good shape — keep the pace."
                : score < 50 ? "A few things need attention. Prioritise by marks."
                : score < 75 ? "Things are piling up. Clear overdue first."
                : "DEFCON 1. Submit whatever you have."

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' }, { id: 'urgent', label: 'Urgent' },
    { id: 'exams', label: 'Exams' }, { id: 'done', label: 'Done' },
  ]

  const handleAdd    = (t: Task) => { addTask(t); toast('📌 Task added!') }
  const handleDelete = (id: string) => { deleteTask(id); toast('🗑️ Deleted') }
  const handleToggle = (id: string) => {
    const t = tasks.find(x => x.id === id)
    toggleTask(id); toast(t?.done ? '↩️ Marked pending' : '✅ Done!')
  }

  return (
    <PageWrapper maxWidth={1100}>
      {showNotif && <NotifBanner tasks={tasks} onClose={() => setShowNotif(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good {getGreeting()} 👋</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {overdue.length > 0
              ? `⚠️ ${overdue.length} overdue — deal with these first.`
              : pending.length > 0 ? `${pending.length} tasks on your plate.`
              : "Nothing pending. You're not cooked 🎉"}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add task
        </button>
      </div>

      {/* ── CARD GRID (Option C) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Stat cards */}
        <div className={cn('card px-4 py-3 flex items-center gap-3', overdue.length > 0 && 'border-red-300 bg-red-50')}>
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', overdue.length > 0 ? 'bg-red-200' : 'bg-slate-100')}>
            <AlertTriangle size={16} className={overdue.length > 0 ? 'text-red-600' : 'text-slate-500'} />
          </div>
          <div>
            <p className={cn('text-2xl font-bold', overdue.length > 0 ? 'text-red-700' : 'text-slate-900')}>{overdue.length}</p>
            <p className="text-xs font-semibold text-slate-500">Overdue</p>
          </div>
        </div>
        <div className="card px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{thisWeek.length}</p>
            <p className="text-xs font-semibold text-slate-500">This week</p>
          </div>
        </div>
        <div className="card px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{done.length}</p>
            <p className="text-xs font-semibold text-slate-500">Completed</p>
          </div>
        </div>
        <div className="card px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <BookOpen size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalMarks}</p>
            <p className="text-xs font-semibold text-slate-500">Marks at stake</p>
          </div>
        </div>
      </div>

      {/* ── MAIN GRID (Option A — dense layout) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-start">

        {/* Left: task list */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Assignments & Exams</span>
              <span className="badge badge-indigo">{pending.length}</span>
            </div>
            <div className="flex gap-0.5 bg-slate-200 rounded-lg p-0.5">
              {FILTERS.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-bold transition-colors',
                  filter === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                )}>{f.label}</button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm font-medium text-slate-400">No tasks here 🎉</div>
          ) : (
            <ul className="divide-y-2 divide-slate-100">
              {filtered.map(t => {
                const d = getDaysLeft(t.deadline)
                const isOverdue = d < 0 && !t.done
                return (
                  <li key={t.id} className={cn('px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors', t.done && 'opacity-50')}>
                    <button
                      onClick={() => handleToggle(t.id)}
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                        t.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500'
                      )}
                    >
                      {t.done && <Check size={10} strokeWidth={3} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-semibold', t.done ? 'line-through text-slate-400' : 'text-slate-900')}>{t.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {t.subject && <span className="text-xs font-medium text-slate-400">{t.subject}</span>}
                        {t.marks ? <span className="text-xs font-medium text-slate-400">{t.marks}m</span> : null}
                        <span className={cn('text-xs font-semibold', isOverdue ? 'text-red-600' : 'text-slate-400')}>
                          {isOverdue ? `⚠ ${Math.abs(d)}d over` : d === 0 ? 'Today' : fmtDate(t.deadline)}
                        </span>
                      </div>
                    </div>
                    <span className={cn('badge flex-shrink-0 text-xs',
                      t.type === 'exam' ? 'badge-purple' : d < 0 ? 'badge-red' : d <= 3 ? 'badge-amber' : 'badge-green'
                    )}>
                      {t.type === 'exam' ? 'Exam' : d < 0 ? 'Overdue' : d <= 3 ? 'Urgent' : 'OK'}
                    </span>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-slate-300 hover:text-red-600 transition-colors flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Right column — dense cards */}
        <div className="space-y-3">

          {/* Cooked-o-meter — compact */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cooked-o-meter</span>
              <span className={cn('badge text-xs', scoreColor)}>{scoreLabel}</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${score}%`, background: 'linear-gradient(90deg,#10b981,#f59e0b,#ef4444)' }}
                />
              </div>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">{verdict}</p>
              <div className="space-y-1">
                {priorities.map((t, i) => {
                  const d = getDaysLeft(t.deadline)
                  return (
                    <div key={t.id} className="flex items-center gap-2 rounded-lg bg-slate-50 border-2 border-slate-200 px-2.5 py-1.5">
                      <span className={cn('w-4 h-4 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                        i === 0 ? 'bg-red-500' : i === 1 ? 'bg-amber-500' : 'bg-slate-400'
                      )}>{i+1}</span>
                      <span className="flex-1 text-xs font-semibold text-slate-800 truncate">{t.title}</span>
                      <span className={cn('text-xs font-bold', d < 0 ? 'text-red-600' : d <= 2 ? 'text-amber-600' : 'text-slate-400')}>
                        {d < 0 ? `${Math.abs(d)}d` : d === 0 ? 'today' : `${d}d`}
                      </span>
                    </div>
                  )
                })}
                {!priorities.length && <p className="text-xs text-slate-400 text-center py-1">Nothing pending 🎉</p>}
              </div>
            </div>
          </div>

          {/* Mini 7-day calendar */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Next 7 days</span>
              {setPage && (
                <button onClick={() => setPage('calendar')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Full cal →</button>
              )}
            </div>
            <div className="p-2 grid grid-cols-7 gap-1">
              {miniCal.map((day, i) => (
                <div key={i} className={cn(
                  'flex flex-col items-center gap-0.5 py-1.5 px-0.5 rounded-lg border-2 transition-colors',
                  day.isToday ? 'bg-indigo-50 border-indigo-300' : day.tasks.length > 0 ? 'bg-amber-50 border-amber-200' : 'border-slate-100 bg-slate-50'
                )}>
                  <span className={cn('text-xs font-bold', day.isToday ? 'text-indigo-700' : 'text-slate-500')}>{day.label.slice(0,2)}</span>
                  <span className={cn('text-sm font-bold', day.isToday ? 'text-indigo-900' : 'text-slate-700')}>{day.date}</span>
                  {day.tasks.length > 0 && (
                    <span className={cn('text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center',
                      day.isToday ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
                    )}>{day.tasks.length}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick nav shortcuts */}
          {setPage && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { page: 'timer' as Page,     icon: Timer,    label: 'Study Timer', color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
                { page: 'analytics' as Page, icon: BarChart2, label: 'Analytics',   color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
                { page: 'calendar' as Page,  icon: Calendar,  label: 'Calendar',    color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' },
                { page: 'streaks' as Page,   icon: Flame,     label: 'Streaks',     color: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100' },
              ].map(({ page: pg, icon: Icon, label, color }) => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={cn('flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-xs font-bold transition-colors', color)}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd && <AddTaskModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
    </PageWrapper>
  )
}
