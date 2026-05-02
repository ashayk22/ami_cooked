'use client'
import { useMemo } from 'react'
import type { Task } from '@/lib/types'
import { getDaysLeft, subColor, TYPE_EMOJI } from '@/lib/utils'
import PageWrapper, { Panel, PanelHeader, PanelBody, StatCard, PageTitle } from '@/components/Layout'

interface Props { tasks: Task[] }

export default function AnalyticsPage({ tasks }: Props) {
  const subjects = useMemo(() => {
    const map: Record<string, { pending: number; done: number; pendingMarks: number }> = {}
    tasks.forEach(t => {
      const s = t.subject || 'Other'
      if (!map[s]) map[s] = { pending: 0, done: 0, pendingMarks: 0 }
      if (t.done) map[s].done++
      else { map[s].pending++; map[s].pendingMarks += t.marks || 0 }
    })
    return Object.entries(map).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.pendingMarks - a.pendingMarks)
  }, [tasks])

  const typeBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    tasks.forEach(t => { const k = t.type || 'other'; map[k] = (map[k] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [tasks])

  const totalDone     = tasks.filter(t => t.done).length
  const totalPending  = tasks.filter(t => !t.done).length
  const totalMarks    = tasks.filter(t => !t.done).reduce((a, t) => a + (t.marks || 0), 0)
  const overdue       = tasks.filter(t => !t.done && getDaysLeft(t.deadline) < 0).length
  const completionPct = totalDone + totalPending > 0 ? Math.round(totalDone / (totalDone + totalPending) * 100) : 0
  const maxPending    = Math.max(...subjects.map(s => s.pendingMarks), 1)

  return (
    <PageWrapper maxWidth={1100}>
      <PageTitle>Subject <em style={{ color: '#6366f1', fontStyle: 'italic' }}>Analytics</em></PageTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        <StatCard label="Completion" value={completionPct + '%'} sub="all time"   color="#059669" />
        <StatCard label="Done"       value={totalDone}           sub="completed"  color="#2563eb"  />
        <StatCard label="Pending"    value={totalPending}        sub="to go"      color="#d97706" />
        <StatCard label="Marks at risk" value={totalMarks}       sub="pending tasks" color="#dc2626" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 14, alignItems: 'start' }}>

        {/* Subject bars */}
        <Panel>
          <PanelHeader>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Marks at stake by subject</div>
          </PanelHeader>
          <PanelBody style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!subjects.length && (
              <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: 'var(--font-mono),monospace', fontSize: 10, color: '#94a3b8' }}>No data yet — add some tasks!</div>
            )}
            {subjects.map(s => {
              const col    = subColor(s.name)
              const barPct = Math.round((s.pendingMarks / maxPending) * 100)
              return (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono),monospace', fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${col}20`, color: col, fontWeight: 500 }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.pending} pending · {s.done} done</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono),monospace', fontSize: 11, color: col, fontWeight: 700 }}>{s.pendingMarks}m</span>
                  </div>
                  <div style={{ height: 5, background: '#f8fafc', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barPct}%`, background: col, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )
            })}
          </PanelBody>
        </Panel>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Panel>
            <PanelHeader><div style={{ fontSize: 12, fontWeight: 700 }}>Task types</div></PanelHeader>
            <PanelBody style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {typeBreakdown.map(([type, count]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', background: '#e2e8f0', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 13 }}>{TYPE_EMOJI[type] ?? '📌'}</span>
                  <div style={{ flex: 1, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{type}</div>
                  <div style={{ fontFamily: 'var(--font-mono),monospace', fontSize: 10, color: '#475569' }}>{count}</div>
                </div>
              ))}
            </PanelBody>
          </Panel>

          <Panel>
            <PanelBody>
              <div style={{ fontFamily: 'var(--font-mono),monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 6 }}>Overdue</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: overdue > 0 ? '#dc2626' : '#059669', letterSpacing: '-0.04em', marginBottom: 3 }}>{overdue}</div>
              <div style={{ fontFamily: 'var(--font-mono),monospace', fontSize: 9, color: '#94a3b8' }}>{overdue > 0 ? 'needs attention now' : 'all caught up!'}</div>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelBody>
              <div style={{ fontFamily: 'var(--font-mono),monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 8 }}>Overall progress</div>
              <div style={{ height: 6, background: '#f8fafc', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${completionPct}%`, background: 'linear-gradient(90deg,#6366f1,#059669)', borderRadius: 3 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono),monospace', fontSize: 9, color: '#94a3b8' }}>
                <span>{completionPct}% done</span>
                <span>{totalDone}/{totalDone+totalPending}</span>
              </div>
            </PanelBody>
          </Panel>
        </div>
      </div>
    </PageWrapper>
  )
}
