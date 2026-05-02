'use client'
import { useState, useMemo } from 'react'
import type { Task } from '@/lib/types'
import { getUrgency, URGENCY_COLOR } from '@/lib/utils'
import PageWrapper, { PageTitle } from '@/components/Layout'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const URGENCY_RANK: Record<string, number> = { overdue: 4, urgent: 3, soon: 2, ok: 1, done: 0 }

const CELL_BG: Record<string, string> = {
  overdue: 'rgba(220,38,38,0.18)',
  urgent:  'rgba(217,119,6,0.18)',
  soon:    'rgba(37,99,235,0.14)',
  ok:      'transparent',
  done:    'transparent',
}

interface Props { tasks: Task[] }

export default function CalendarPage({ tasks }: Props) {
  const now = new Date()
  const [month, setMonth] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const today = new Date(); today.setHours(0,0,0,0)

  const firstDay    = new Date(month.y, month.m, 1).getDay()
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate()
  const cells: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)]

  const tasksByDay = useMemo(() => {
    const map: Record<number, Task[]> = {}
    tasks.forEach(t => {
      const d = new Date(t.deadline)
      if (d.getFullYear()===month.y && d.getMonth()===month.m) {
        const k = d.getDate(); if (!map[k]) map[k]=[]
        map[k].push(t)
      }
    })
    return map
  }, [tasks, month])

  const prev = () => { const d=new Date(month.y,month.m-1); setMonth({y:d.getFullYear(),m:d.getMonth()}) }
  const next = () => { const d=new Date(month.y,month.m+1); setMonth({y:d.getFullYear(),m:d.getMonth()}) }
  const nb: React.CSSProperties = { background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:7, padding:'6px 14px', color:'#0f172a', fontSize:12, cursor:'pointer', fontFamily:'var(--font-syne),sans-serif' }

  return (
    <PageWrapper maxWidth={1100}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
        <PageTitle><em style={{ color:'#6366f1', fontStyle:'italic' }}>Calendar</em> view</PageTitle>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button style={nb} onClick={prev}>←</button>
          <span style={{ fontFamily:'var(--font-mono),monospace', fontSize:11, minWidth:140, textAlign:'center', color:'#475569' }}>{MONTHS[month.m]} {month.y}</span>
          <button style={nb} onClick={next}>→</button>
        </div>
      </div>

      <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:10, overflow:'hidden' }}>
        {/* Day headers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
          {DAYS.map(d=>(
            <div key={d} style={{ padding:'12px 0', textAlign:'center', fontFamily:'var(--font-mono),monospace', fontSize:11, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em' }}>{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {cells.map((day, i) => {
            if (!day) return (
              <div key={i} style={{ minHeight:120, background:'rgba(21,61,149,0.4)', borderRight:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0' }} />
            )

            const cd = new Date(month.y, month.m, day); cd.setHours(0,0,0,0)
            const isToday = cd.getTime() === today.getTime()
            const dt = tasksByDay[day] ?? []

            // Find worst urgency among pending tasks for this day
            const pending = dt.filter(t => !t.done)
            const worstUrgency = pending.reduce<string|null>((worst, t) => {
              const u = getUrgency(t)
              return (!worst || URGENCY_RANK[u] > URGENCY_RANK[worst]) ? u : worst
            }, null)

            const accentColor = worstUrgency ? URGENCY_COLOR[worstUrgency] : null
            const cellBg = isToday ? 'rgba(96,200,255,0.12)' : (worstUrgency ? CELL_BG[worstUrgency] : 'transparent')
            const leftBorder = !isToday && accentColor ? `4px solid ${accentColor}` : '1px solid #e2e8f0'

            const numBg = isToday ? '#6366f1' : worstUrgency === 'overdue' ? 'rgba(220,38,38,0.25)' : 'transparent'
            const numColor = isToday ? 'white' : accentColor ?? '#475569'
            const numWeight = isToday || worstUrgency === 'overdue' ? 700 : 500

            return (
              <div key={i} style={{
                minHeight: 120,
                padding: '10px 8px',
                borderRight: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0',
                borderLeft: leftBorder,
                background: cellBg,
                transition: 'background 0.15s',
              }}>
                <div style={{
                  width:26, height:26, borderRadius:'50%',
                  background: numBg,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--font-mono),monospace', fontSize:13,
                  color: numColor, fontWeight: numWeight,
                  marginBottom: 6,
                }}>{day}</div>

                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  {dt.slice(0,3).map(t => {
                    const col = t.done ? '#94a3b8' : URGENCY_COLOR[getUrgency(t)]
                    return (
                      <div key={t.id} title={t.title} style={{
                        fontSize:11, fontFamily:'var(--font-mono),monospace',
                        padding:'3px 7px', borderRadius:4,
                        background:`${col}44`, color:col,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      }}>{t.title}</div>
                    )
                  })}
                  {dt.length > 3 && (
                    <div style={{ fontSize:11, fontFamily:'var(--font-mono),monospace', color:'#94a3b8', paddingLeft:7 }}>
                      +{dt.length-3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:20, fontFamily:'var(--font-mono),monospace', fontSize:11, color:'#94a3b8' }}>
        {[['#dc2626','Overdue'],['#d97706','Due soon'],['#2563eb','This week'],['#059669','Later']].map(([col,lbl])=>(
          <div key={lbl} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:9, height:9, borderRadius:2, background:col }} />{lbl}
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}