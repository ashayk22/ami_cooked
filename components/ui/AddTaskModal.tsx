'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import type { Task } from '@/lib/types'

const TYPES = ['assignment','exam','quiz','lab','project'] as const
const SUBJECTS = ['Maths','Physics','Chemistry','Biology','CS','History','English','OS','DBMS','CN','DSA','SE','Other']

interface Props { onAdd: (t: Task) => void; onClose: () => void }

export default function AddTaskModal({ onAdd, onClose }: Props) {
  const [title,    setTitle]    = useState('')
  const [subject,  setSubject]  = useState('')
  const [type,     setType]     = useState<typeof TYPES[number]>('assignment')
  const [deadline, setDeadline] = useState('')
  const [marks,    setMarks]    = useState('')
  const [notes,    setNotes]    = useState('')

  const save = () => {
    if (!title.trim() || !deadline) return
    onAdd({
      id: `t-${Date.now()}`, title: title.trim(), subject, type,
      deadline, marks: marks ? Number(marks) : 0,
      notes, done: false, createdAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-full max-w-md p-6 animate-[slideUp_0.2s_ease]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-900">New task</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)}
              autoFocus placeholder="Assignment or exam name" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <select className="input" value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="">— select —</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={type} onChange={e => setType(e.target.value as typeof TYPES[number])}>
                {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Deadline *</label>
              <input type="datetime-local" className="input" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
            <div>
              <label className="label">Marks / weight</label>
              <input type="number" className="input" value={marks} onChange={e => setMarks(e.target.value)} placeholder="e.g. 20" min={0} />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} value={notes}
              onChange={e => setNotes(e.target.value)} placeholder="Optional details…" />
          </div>

          <div className="flex gap-2 pt-1">
            <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button className="btn-primary flex-1" onClick={save} disabled={!title.trim() || !deadline}>
              Add task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
