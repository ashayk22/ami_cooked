'use client'
import { BookOpen, LayoutDashboard, Calendar, BarChart2, Flame, Timer, StickyNote, Bell, Settings, LogOut } from 'lucide-react'
import type { Page } from '@/lib/types'
import { cn } from '@/lib/cn'

const NAV: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'calendar',  label: 'Calendar',   icon: Calendar },
  { id: 'analytics', label: 'Analytics',  icon: BarChart2 },
  { id: 'streaks',   label: 'Streaks',    icon: Flame },
  { id: 'timer',     label: 'Timer',      icon: Timer },
  { id: 'notes',     label: 'Notes',      icon: StickyNote },
  { id: 'reminders', label: 'Reminders',  icon: Bell },
  { id: 'settings',  label: 'Settings',   icon: Settings },
]

interface Props {
  page: Page
  setPage: (p: Page) => void
  userName?: string
  onSignOut?: () => void
}

export default function Sidebar({ page, setPage, userName, onSignOut }: Props) {
  const initials = (userName || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-60 flex-col border-r-2 border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b-2 border-slate-200">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white flex-shrink-0">
          <BookOpen size={16} />
        </div>
        <div>
          <span className="font-bold text-slate-900 text-sm">Am I Cooked?</span>
          <p className="text-xs font-medium text-slate-400 leading-none mt-0.5">study tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={cn(
              'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors text-left',
              page === id
                ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-2 border-transparent'
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer — user + sign out */}
      <div className="px-3 py-3 border-t-2 border-slate-200 space-y-1">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-50 border-2 border-slate-200">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 border-indigo-200">
            {initials}
          </div>
          <span className="flex-1 text-xs font-semibold text-slate-700 truncate">{userName || 'Student'}</span>
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 border-2 border-transparent hover:border-red-200 transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        )}
      </div>
    </aside>
  )
}
