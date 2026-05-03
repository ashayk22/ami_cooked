'use client'
import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import type { Page } from '@/lib/types'
import { useStore } from '@/lib/store'
import Sidebar        from '@/components/Sidebar'
import BottomNav      from '@/components/BottomNav'
import Toast          from '@/components/ui/Toast'
import RightRail      from '@/components/ui/RightRail'
import AuthPage       from '@/components/AuthPage'
import DashboardPage  from '@/components/pages/DashboardPage'
import CalendarPage   from '@/components/pages/CalendarPage'
import AnalyticsPage  from '@/components/pages/AnalyticsPage'
import StreaksPage     from '@/components/pages/StreaksPage'
import TimerPage      from '@/components/pages/TimerPage'
import NotesPage      from '@/components/pages/NotesPage'
import RemindersPage  from '@/components/pages/RemindersPage'
import SettingsPage   from '@/components/pages/SettingsPage'

const NO_RAIL: Page[] = ['settings', 'timer']

export default function App() {
  const { tasks, user, authUser, loading, setTasks, setUser, addTask, toggleTask, deleteTask, signOut } = useStore()
  const [page,  setPage]  = useState<Page>('dashboard')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => setToast(msg), [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading…</p>
        </div>
      </div>
    )
  }

  if (!authUser) return <AuthPage />

  const pageProps = { tasks, user, setTasks, setUser, addTask, toggleTask, deleteTask, toast: showToast }
  const showRail  = !NO_RAIL.includes(page)

  const handleSignOut = async () => { await signOut(); showToast('👋 Signed out') }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage  {...pageProps} setPage={setPage} />
      case 'calendar':  return <CalendarPage   tasks={tasks} />
      case 'analytics': return <AnalyticsPage  tasks={tasks} />
      case 'streaks':   return <StreaksPage     tasks={tasks} />
      case 'timer':     return <TimerPage       tasks={tasks} />
      case 'notes':     return <NotesPage       tasks={tasks} />
      case 'reminders': return <RemindersPage   tasks={tasks} />
      case 'settings':  return <SettingsPage    {...pageProps} />
      default:          return <DashboardPage  {...pageProps} setPage={setPage} />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <Sidebar page={page} setPage={setPage} userName={user?.name || authUser.email} onSignOut={handleSignOut} />

      {/* Main + right rail */}
      <div className="flex-1 md:ml-60 min-h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto min-w-0 pb-20 md:pb-0">
          <div className="flex min-h-full">
            <div className="flex-1 min-w-0">
              {renderPage()}
            </div>
            {showRail && (
              <div className="hidden xl:block w-72 flex-shrink-0 border-l-2 border-slate-200 bg-white px-4 py-6">
                <RightRail tasks={tasks} addTask={addTask} toggleTask={toggleTask} toast={showToast} setPage={setPage} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav page={page} setPage={setPage} addTask={addTask} toast={showToast} />

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
