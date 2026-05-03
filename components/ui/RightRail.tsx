'use client'
import { useState } from 'react'
import { Plus, Flame, Clock, AlertTriangle, BookOpen } from 'lucide-react'
import type { Task, Page } from '@/lib/types'
import { getDaysLeft, fmtDate, getCookedScore } from '@/lib/utils'
import { cn } from '@/lib/cn'
import AddTaskModal from '@/components/ui/AddTaskModal'

interface Props {
  tasks: Task[]
  addTask?: (t: Task) => void
  toggleTask?: (id: string) => void
  toast?: (msg: string) => void
  setPage?: (p: Page) => void
}

export default function RightRail({ tasks, addTask, toggleTask, toast, setPage }: Props) {
  const [showAdd, setShowAdd] = useState(false)

  const pending  = tasks.filter(t => !t.done)
  const overdue  = pending.filter(t => getDaysLeft(t.deadline) < 0)
  const thisWeek = pending.filter(t => { const d = getDaysLeft(t.deadline); return d >= 0 && d <= 7 })
  const score    = getCookedScore(tasks)

  const scoreCls = score < 25 ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
                 : score < 50 ? 'text-amber-700 bg-amber-100 border-amber-300'
                 : score < 75 ? 'text-orange-700 bg-orange-100 border-orange-300'
                 : 'text-red-700 bg-red-100 border-red-300'
  const scoreLabel = score < 25 ? 'Chill 😌' : score < 50 ? 'Shaky 😬' : score < 75 ? 'Borderline 😰' : 'Cooked 🔥'

  const next5 = [...pending]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  const handleAdd = (t: Task) => {
    addTask?.(t)
    toast?.('📌 Task added!')
    setShowAdd(false)
  }

  return (
    <aside className="flex flex-col gap-3 w-full flex-shrink-0">

      {/* Quick add */}
      {addTask && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full btn-primary py-2.5 justify-center"
        >
          <Plus size={15} /> Quick add task
        </button>
      )}

      {/* Status strip */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-2 divide-x-2 divide-slate-200">
          <div className={cn('px-3 py-3 flex flex-col items-center gap-0.5', overdue.length > 0 ? 'bg-red-50' : '')}>
            <AlertTriangle size={15} className={overdue.length > 0 ? 'text-red-600' : 'text-slate-400'} />
            <span className={cn('text-xl font-bold', overdue.length > 0 ? 'text-red-700' : 'text-slate-700')}>{overdue.length}</span>
            <span className="text-xs font-semibold text-slate-500">Overdue</span>
          </div>
          <div className="px-3 py-3 flex flex-col items-center gap-0.5">
            <Clock size={15} className="text-amber-500" />
            <span className="text-xl font-bold text-slate-700">{thisWeek.length}</span>
            <span className="text-xs font-semibold text-slate-500">This week</span>
          </div>
        </div>
        <div className="border-t-2 border-slate-200 grid grid-cols-2 divide-x-2 divide-slate-200">
          <div className="px-3 py-3 flex flex-col items-center gap-0.5">
            <BookOpen size={15} className="text-indigo-500" />
            <span className="text-xl font-bold text-slate-700">{pending.length}</span>
            <span className="text-xs font-semibold text-slate-500">Pending</span>
          </div>
          <div className="px-3 py-3 flex flex-col items-center gap-0.5">
            <Flame size={15} className="text-orange-500" />
            <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full border-2 mt-0.5', scoreCls)}>{scoreLabel}</span>
          </div>
        </div>
      </div>

      {/* Cooked-o-meter bar */}
      <div className="card px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">Cooked-o-meter</span>
          <span className="text-xs font-bold text-slate-500">{score}%</span>
        </div>
        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: 'linear-gradient(90deg,#10b981,#f59e0b,#ef4444)' }}
          />
        </div>
        <div className="flex justify-between text-xs font-semibold text-slate-400">
          <span>Chill</span><span>Shaky</span><span>Cooked</span>
        </div>
      </div>

      {/* Upcoming tasks */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b-2 border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Up next</span>
          {setPage && (
            <button onClick={() => setPage('calendar')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View all →
            </button>
          )}
        </div>
        {next5.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-5 font-medium">All clear 🎉</p>
        ) : (
          <ul className="divide-y-2 divide-slate-100">
            {next5.map(t => {
              const d      = getDaysLeft(t.deadline)
              const dotCls = d < 0 ? 'bg-red-500' : d <= 3 ? 'bg-amber-500' : d <= 7 ? 'bg-indigo-500' : 'bg-emerald-500'
              const timeCls = d < 0 ? 'text-red-600 font-bold' : d <= 3 ? 'text-amber-600 font-bold' : 'text-slate-400'
              return (
                <li key={t.id} className="flex items-center gap-2.5 px-4 py-2.5">
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dotCls)} />
                  <span className="flex-1 text-xs font-medium text-slate-800 truncate">{t.title}</span>
                  <span className={cn('text-xs flex-shrink-0', timeCls)}>
                    {d < 0 ? `${Math.abs(d)}d` : d === 0 ? 'Today' : `${d}d`}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Quick complete - show top task */}
      {next5[0] && toggleTask && (
        <div className="card px-4 py-3 border-2 border-indigo-200 bg-indigo-50">
          <p className="text-xs font-bold text-indigo-600 mb-1.5">🎯 Focus on this</p>
          <p className="text-sm font-semibold text-slate-900 leading-tight mb-2">{next5[0].title}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{next5[0].subject || 'No subject'}</span>
            <button
              onClick={() => { toggleTask(next5[0].id); toast?.('✅ Done!') }}
              className="text-xs font-bold text-indigo-700 bg-white border-2 border-indigo-300 rounded-lg px-2.5 py-1 hover:bg-indigo-100 transition-colors"
            >
              Mark done ✓
            </button>
          </div>
        </div>
      )}

      {showAdd && <AddTaskModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
    </aside>
  )
}
