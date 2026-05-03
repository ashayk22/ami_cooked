'use client'
import { useState } from 'react'
import { LayoutDashboard, Calendar, Timer, StickyNote, MoreHorizontal, BarChart2, Flame, Bell, Settings, X, Plus } from 'lucide-react'
import type { Page } from '@/lib/types'
import type { Task } from '@/lib/types'
import { cn } from '@/lib/cn'
import AddTaskModal from '@/components/ui/AddTaskModal'

const PRIMARY_NAV: { id: Page; icon: React.ElementType; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Home'     },
  { id: 'calendar',  icon: Calendar,        label: 'Calendar' },
  { id: 'timer',     icon: Timer,           label: 'Timer'    },
  { id: 'notes',     icon: StickyNote,      label: 'Notes'    },
]

const MORE_NAV: { id: Page; icon: React.ElementType; label: string }[] = [
  { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  { id: 'streaks',   icon: Flame,     label: 'Streaks'   },
  { id: 'reminders', icon: Bell,      label: 'Reminders' },
  { id: 'settings',  icon: Settings,  label: 'Settings'  },
]

interface Props {
  page: Page
  setPage: (p: Page) => void
  addTask: (t: Task) => void
  toast: (msg: string) => void
}

export default function BottomNav({ page, setPage, addTask, toast }: Props) {
  const [showMore, setShowMore] = useState(false)
  const [showAdd,  setShowAdd]  = useState(false)

  const handleAdd = (t: Task) => { addTask(t); toast('📌 Task added!'); setShowAdd(false) }
  const nav = (p: Page) => { setPage(p); setShowMore(false) }

  return (
    <>
      {/* More drawer */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMore(false)} />
          <div className="relative bg-white rounded-t-2xl border-t-2 border-slate-200 px-4 pt-4 pb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-700">More</span>
              <button onClick={() => setShowMore(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {MORE_NAV.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => nav(id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-colors',
                    page === id ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600'
                  )}
                >
                  <Icon size={20} />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-slate-200 px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {PRIMARY_NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => nav(id)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                page === id ? 'text-indigo-600' : 'text-slate-400'
              )}
            >
              <Icon size={22} strokeWidth={page === id ? 2.5 : 1.8} />
              <span className={cn('text-[10px] font-semibold', page === id ? 'text-indigo-600' : 'text-slate-400')}>{label}</span>
            </button>
          ))}

          {/* FAB — add task */}
          <button
            onClick={() => setShowAdd(true)}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 -mt-4 border-4 border-white"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => setShowMore(s => !s)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
              MORE_NAV.some(n => n.id === page) ? 'text-indigo-600' : 'text-slate-400'
            )}
          >
            <MoreHorizontal size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </nav>

      {showAdd && <AddTaskModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
    </>
  )
}
