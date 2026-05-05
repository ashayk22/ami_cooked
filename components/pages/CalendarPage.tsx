'use client'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '@/lib/types'
import { getUrgency } from '@/lib/utils'
import PageWrapper from '@/components/Layout'
import { cn } from '@/lib/cn'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_FULL  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAYS_SHORT = ['S','M','T','W','T','F','S']

interface Props { tasks: Task[] }

export default function CalendarPage({ tasks }: Props) {
  const now   = new Date()
  const [month, setMonth] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [selected, setSelected] = useState<number | null>(null)
  const today = new Date(); today.setHours(0,0,0,0)

  const firstDay    = new Date(month.y, month.m, 1).getDay()
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate()
  const cells: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)]

  const tasksByDay = useMemo(() => {
    const map: Record<number, Task[]> = {}
    tasks.forEach(t => {
      const d = new Date(t.deadline)
      if (d.getFullYear()===month.y && d.getMonth()===month.m) {
        const k = d.getDate()
        if (!map[k]) map[k] = []
        map[k].push(t)
      }
    })
    return map
  }, [tasks, month])

  const prev = () => { const d = new Date(month.y, month.m-1); setMonth({y:d.getFullYear(), m:d.getMonth()}); setSelected(null) }
  const next = () => { const d = new Date(month.y, month.m+1); setMonth({y:d.getFullYear(), m:d.getMonth()}); setSelected(null) }

  const dotColor = (t: Task) => {
    const u = getUrgency(t)
    if (t.done)       return 'bg-emerald-400'
    if (u==='overdue') return 'bg-red-500'
    if (u==='urgent')  return 'bg-amber-500'
    if (u==='soon')    return 'bg-indigo-500'
    return 'bg-slate-400'
  }

  const selectedTasks = selected ? (tasksByDay[selected] || []) : []

  const isToday = (d: number) => {
    return d === today.getDate() && month.m === today.getMonth() && month.y === today.getFullYear()
  }

  return (
    <PageWrapper maxWidth={1100}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          <em className="text-indigo-600 not-italic">Calendar</em> view
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="p-2 rounded-lg border-2 border-slate-200 bg-white hover:bg-slate-50 transition-colors">
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          <span className="text-xs md:text-sm font-bold text-slate-700 min-w-[110px] text-center">
            {MONTHS[month.m].slice(0,3)} {month.y}
          </span>
          <button onClick={next} className="p-2 rounded-lg border-2 border-slate-200 bg-white hover:bg-slate-50 transition-colors">
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b-2 border-slate-200 bg-slate-50">
          {DAYS_FULL.map((d, i) => (
            <div key={d} className="py-2 text-center">
              <span className="hidden sm:inline text-xs font-bold text-slate-500">{d}</span>
              <span className="sm:hidden text-xs font-bold text-slate-500">{DAYS_SHORT[i]}</span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return (
              <div key={`empty-${i}`} className="border-r border-b border-slate-100 bg-slate-50/50 min-h-[48px] md:min-h-[80px]" />
            )
            const dayTasks  = tasksByDay[day] || []
            const isT       = isToday(day)
            const isSel     = selected === day
            const hasTask   = dayTasks.length > 0

            return (
              <div
                key={day}
                onClick={() => setSelected(isSel ? null : day)}
                className={cn(
                  'border-r border-b border-slate-100 min-h-[48px] md:min-h-[80px] p-1 md:p-1.5 cursor-pointer transition-colors',
                  isT   && 'bg-indigo-50',
                  isSel && 'bg-indigo-100 ring-2 ring-inset ring-indigo-400',
                  !isT && !isSel && hasTask && 'bg-amber-50',
                  !isT && !isSel && !hasTask && 'hover:bg-slate-50',
                )}
              >
                {/* Date number */}
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto md:mx-0 mb-1',
                  isT ? 'bg-indigo-600 text-white' : 'text-slate-700'
                )}>{day}</div>

                {/* Task dots on mobile / task chips on desktop */}
                {dayTasks.length > 0 && (
                  <>
                    {/* Mobile: dots only */}
                    <div className="md:hidden flex justify-center gap-0.5 flex-wrap">
                      {dayTasks.slice(0,3).map((t,j) => (
                        <span key={j} className={cn('w-1.5 h-1.5 rounded-full', dotColor(t))} />
                      ))}
                      {dayTasks.length > 3 && <span className="text-[8px] text-slate-400 font-bold">+{dayTasks.length-3}</span>}
                    </div>
                    {/* Desktop: task chips */}
                    <div className="hidden md:flex flex-col gap-0.5">
                      {dayTasks.slice(0,2).map(t => {
                        const u = getUrgency(t)
                        const chipCls = t.done ? 'bg-emerald-100 text-emerald-700'
                          : u==='overdue' ? 'bg-red-100 text-red-700'
                          : u==='urgent'  ? 'bg-amber-100 text-amber-700'
                          : 'bg-indigo-100 text-indigo-700'
                        return (
                          <div key={t.id} className={cn('rounded px-1 py-0.5 text-[10px] font-semibold truncate', chipCls)}>
                            {t.title}
                          </div>
                        )
                      })}
                      {dayTasks.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-bold pl-1">+{dayTasks.length-2} more</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selected && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b-2 border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">
              {MONTHS[month.m]} {selected}, {month.y}
            </span>
            <button onClick={() => setSelected(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">✕</button>
          </div>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6 font-medium">No tasks on this day</p>
          ) : (
            <ul className="divide-y-2 divide-slate-100">
              {selectedTasks.map(t => {
                const u = getUrgency(t)
                const badgeCls = t.done ? 'badge-green'
                  : u==='overdue' ? 'badge-red'
                  : u==='urgent'  ? 'badge-amber'
                  : 'badge-indigo'
                return (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{t.title}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {t.subject || '—'}{t.marks ? ` · ${t.marks} marks` : ''}
                      </p>
                    </div>
                    <span className={cn('badge flex-shrink-0', badgeCls)}>
                      {t.done ? 'Done' : u==='overdue' ? 'Overdue' : u==='urgent' ? 'Urgent' : 'Pending'}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
        {[
          { cls:'bg-red-500',     label:'Overdue'  },
          { cls:'bg-amber-500',   label:'Urgent'   },
          { cls:'bg-indigo-500',  label:'Pending'  },
          { cls:'bg-emerald-400', label:'Done'     },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn('w-2.5 h-2.5 rounded-full', cls)} />
            {label}
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}
