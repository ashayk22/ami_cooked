'use client'
import { AlertTriangle, X } from 'lucide-react'
import type { Task } from '@/lib/types'
import { getDaysLeft } from '@/lib/utils'

export default function NotifBanner({ tasks, onClose }: { tasks: Task[]; onClose: () => void }) {
  const urgent = tasks.filter(t => !t.done && getDaysLeft(t.deadline) <= 0)
  if (!urgent.length) return null
  const t = urgent[0]
  const d = getDaysLeft(t.deadline)

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-900">Priority alert</p>
        <p className="text-xs text-amber-700 mt-0.5">
          <span className="font-semibold">{t.title}</span> is {d === 0 ? 'due TODAY' : `${Math.abs(d)}d overdue`}
          {t.marks ? ` — ${t.marks} marks` : ''}
        </p>
      </div>
      <button onClick={onClose} className="p-1 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}
