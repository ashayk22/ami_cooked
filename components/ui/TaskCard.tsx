'use client'
import { useState } from 'react'
import type { Task } from '@/lib/types'
import { getDaysLeft, getUrgency, subColor, TYPE_EMOJI, URGENCY_COLOR, fmtDate } from '@/lib/utils'

interface Props {
  task:     Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function TaskCard({ task, onToggle, onDelete }: Props) {
  const [hov, setHov] = useState(false)
  const urg  = getUrgency(task)
  const days = getDaysLeft(task.deadline)
  const col  = URGENCY_COLOR[urg]

  const chipTxt =
    task.done    ? 'Done ✓' :
    days < 0     ? `${Math.abs(days)}d overdue` :
    days === 0   ? 'TODAY' :
                   `${days}d left`

  const bgTint =
    urg === 'overdue' ? 'rgba(181,74,74,0.05)' :
    urg === 'urgent'  ? 'rgba(184,124,42,0.05)' :
    '#f1f5f9'

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 14px',
        borderRadius: 9,
        border: `1px solid ${hov ? '#cbd5e1' : '#e2e8f0'}`,
        borderLeft: `3px solid ${col}`,
        background: bgTint,
        transition: 'all 0.15s',
        position: 'relative',
        opacity: task.done ? 0.5 : 1,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        style={{
          width: 18, height: 18, borderRadius: 5, flexShrink: 0,
          border: `2px solid ${task.done ? '#059669' : '#94a3b8'}`,
          background: task.done ? '#059669' : 'transparent',
          color: 'white', fontSize: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {task.done && '✓'}
      </button>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          textDecoration: task.done ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 4,
        }}>
          {TYPE_EMOJI[task.type] ?? '📝'} {task.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 500,
            background: `${subColor(task.subject)}18`,
            color: subColor(task.subject),
          }}>
            {(task.subject || '—').toUpperCase()}
          </span>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: '#94a3b8' }}>
            {task.done ? 'Completed' : days < 0 ? 'Was due' : 'Due'} {fmtDate(task.deadline)}
            {task.notes ? ' · ' + task.notes : ''}
          </span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 80 }}>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, fontWeight: 500, color: '#475569' }}>
          {task.marks > 0 ? `${task.marks} marks` : '—'}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono), monospace', fontSize: 10,
          padding: '2px 8px', borderRadius: 20,
          background: `${col}18`, color: col, whiteSpace: 'nowrap',
        }}>
          {chipTxt}
        </span>
      </div>

      {/* Delete btn (hover) */}
      {hov && (
        <button
          onClick={() => onDelete(task.id)}
          style={{
            position: 'absolute', top: 6, right: 6,
            width: 18, height: 18, borderRadius: 4,
            border: 'none',
            background: 'rgba(220,38,38,0.1)', color: '#dc2626',
            fontSize: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
