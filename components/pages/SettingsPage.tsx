'use client'
import { useState } from 'react'
import { Eye, EyeOff, Download, Trash2, LogOut } from 'lucide-react'
import type { Task, User } from '@/lib/types'
import PageWrapper from '@/components/Layout'

interface Props {
  user: User; setUser: (u: User) => void
  tasks: Task[]; setTasks: (fn: Task[] | ((p: Task[]) => Task[])) => void
  toast: (msg: string) => void
  signOut?: () => Promise<void>
}

export default function SettingsPage({ user, setUser, tasks, setTasks, toast, signOut }: Props) {
  const [form,    setForm]    = useState<User>({ ...user })
  const [apiKey,  setApiKey]  = useState(() => { try { return localStorage.getItem('amic_apikey') ?? '' } catch { return '' } })
  const [showKey, setShowKey] = useState(false)

  const saveProfile = () => { setUser({ ...form, name: form.name || 'Student' }); toast('✅ Profile saved!') }
  const saveApiKey  = () => { try { localStorage.setItem('amic_apikey', apiKey.trim()) } catch {}; toast('🔑 API key saved!') }
  const clearDone   = () => { setTasks(ts => ts.filter(t => !t.done)); toast('🗑️ Cleared completed') }
  const clearAll    = () => { if (!confirm('Delete ALL tasks?')) return; setTasks([]); toast('💥 All tasks deleted') }
  const exportData  = () => {
    const blob = new Blob([JSON.stringify({ tasks, user }, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `amICooked_${new Date().toISOString().split('T')[0]}.json`; a.click()
    URL.revokeObjectURL(url); toast('📦 Exported!')
  }

  const SEMESTERS = ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8']

  return (
    <PageWrapper maxWidth={640}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your profile, AI key, and data.</p>
      </div>

      {/* Profile */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Semester</label>
            <select className="input" value={form.semester || ''} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
              <option value="">— select —</option>
              {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">College / University</label>
          <input className="input" value={form.college || ''} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} placeholder="e.g. Delhi University" />
        </div>
        <button className="btn-primary" onClick={saveProfile}>Save profile</button>
      </div>

      {/* AI */}
      <div className="card p-6 space-y-3">
        <h2 className="font-semibold text-slate-900">AI task breakdowns</h2>
        <p className="text-sm text-slate-500">
          Paste your Anthropic API key to unlock personalised AI breakdowns on the Timer page.
          Key is stored only in your browser — never sent anywhere except Anthropic.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              className="input pr-10"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
            />
            <button
              onClick={() => setShowKey(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button className="btn-primary flex-shrink-0" onClick={saveApiKey}>Save key</button>
        </div>
        <p className="text-xs text-slate-400">
          Get a free key at <span className="text-indigo-600">console.anthropic.com</span> · uses claude-haiku (~$0.001 per breakdown)
        </p>
      </div>

      {/* Data */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Data</h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={exportData}>
            <Download size={14} /> Export JSON
          </button>
          <button className="btn-secondary" onClick={clearDone}>
            <Trash2 size={14} /> Clear completed
          </button>
          <button className="btn-danger" onClick={clearAll}>
            <Trash2 size={14} /> Delete all tasks
          </button>
        </div>
        <p className="text-xs text-slate-400">{tasks.length} total tasks · {tasks.filter(t => t.done).length} completed</p>
      </div>

      {/* Sign out */}
      {signOut && (
        <div className="card p-4 border-red-200 bg-red-50">
          <button
            onClick={async () => { await signOut(); toast('👋 Signed out') }}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800"
          >
            <LogOut size={15} /> Sign out of Am I Cooked?
          </button>
        </div>
      )}
    </PageWrapper>
  )
}
