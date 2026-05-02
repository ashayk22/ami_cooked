'use client'
import { useState, useEffect } from 'react'
import type { Task } from '@/lib/types'
import { getDaysLeft, subColor, URGENCY_COLOR, getUrgency, ls } from '@/lib/utils'

interface Props { tasks: Task[] }

export default function NotesPage({ tasks }: Props) {
  const fromTasks = Array.from(new Set(tasks.map(t => t.subject).filter(Boolean))) as string[]
  const [notes,  setNotes]  = useState<Record<string, string>>({})
  const [active, setActive] = useState('General')
  const [newSub, setNewSub] = useState('')

  useEffect(() => {
    const saved = ls.get<Record<string, string>>('amic_notes', {})
    setNotes(saved)
    if (fromTasks.length > 0) setActive(fromTasks[0])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allSubs     = [...new Set([...fromTasks, ...Object.keys(notes), 'General'])]
  const activeTasks = tasks.filter(t => t.subject === active && !t.done)
  const charCount   = (notes[active] || '').length

  const saveNote = (sub: string, val: string) => {
    const updated = { ...notes, [sub]: val }
    setNotes(updated)
    ls.set('amic_notes', updated)
  }

  const addSubject = () => {
    const s = newSub.trim(); if (!s) return
    setActive(s); setNewSub('')
    if (!notes[s]) saveNote(s, '')
  }

  return (
    <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0, height:'100%' }}>

      {/* Sidebar */}
      <div style={{ width:192, flexShrink:0, background:'#ffffff', borderRight:'1px solid #e2e8f0', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'18px 12px 12px', borderBottom:'1px solid #e2e8f0' }}>
          <div style={{ fontSize:11, fontWeight:700, marginBottom:10, color:'#0f172a' }}>Quick Notes</div>
          <div style={{ display:'flex', gap:5 }}>
            <input
              value={newSub}
              onChange={e=>setNewSub(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&addSubject()}
              placeholder="New subject…"
              style={{ flex:1, fontFamily:'var(--font-mono),monospace', fontSize:10, padding:'6px 8px', borderRadius:6, border:'1px solid #cbd5e1', background:'#e2e8f0', color:'#0f172a', outline:'none' }}
            />
            <button onClick={addSubject} style={{ padding:'6px 10px', borderRadius:6, border:'none', background:'#6366f1', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>+</button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'8px 6px', display:'flex', flexDirection:'column', gap:2 }}>
          {allSubs.map(s => {
            const count    = tasks.filter(t => t.subject===s && !t.done).length
            const isActive = active === s
            const col      = subColor(s)
            return (
              <button key={s} onClick={()=>setActive(s)} style={{
                textAlign:'left', padding:'8px 9px', borderRadius:7,
                fontSize:11, fontWeight:600, fontFamily:'var(--font-syne),sans-serif',
                border:`1px solid ${isActive?col:'transparent'}`,
                borderLeft:`3px solid ${isActive?col:'transparent'}`,
                background:isActive?`${col}14`:'transparent',
                color:isActive?col:'#475569',
                cursor:'pointer', width:'100%',
                display:'flex', alignItems:'center', justifyContent:'space-between',
                transition:'all 0.12s',
              }}>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s}</span>
                {count>0&&<span style={{ fontFamily:'var(--font-mono),monospace', fontSize:8, color:'#d97706', marginLeft:4, flexShrink:0 }}>{count}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Editor — full width */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#f8fafc', minHeight:0 }}>
        <div style={{ width:'100%', flex:1, display:'flex', flexDirection:'column', padding:'24px 28px 20px', minHeight:0, overflow:'hidden' }}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14, gap:12 }}>
            <div>
              <h2 style={{ fontFamily:'var(--font-serif),serif', fontSize:'1.4rem', marginBottom:3 }}>
                <em style={{ color:subColor(active), fontStyle:'italic' }}>{active}</em> notes
              </h2>
              <div style={{ fontFamily:'var(--font-mono),monospace', fontSize:9, color:'#94a3b8' }}>
                {activeTasks.length>0 ? `${activeTasks.length} pending task${activeTasks.length!==1?'s':''} in this subject` : 'No pending tasks here'}
              </div>
            </div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'flex-end', maxWidth:260 }}>
              {activeTasks.slice(0,2).map(t=>{
                const d   = getDaysLeft(t.deadline)
                const col = URGENCY_COLOR[getUrgency(t)]
                return (
                  <span key={t.id} style={{ fontFamily:'var(--font-mono),monospace', fontSize:13, padding:'4px 12px', borderRadius:20, background:`${col}18`, color:col, whiteSpace:'nowrap' }}>
                    {t.title.length>18?t.title.slice(0,18)+'…':t.title} · {d<0?'overdue':d===0?'today':`${d}d`}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={notes[active]||''}
            onChange={e=>saveNote(active,e.target.value)}
            placeholder={`Notes for ${active}…\n\nFormulas, key points, reminders — anything.`}
            style={{ flex:1, background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:9, padding:'16px 18px', color:'#0f172a', fontFamily:'var(--font-mono),monospace', fontSize:12, lineHeight:1.85, resize:'none', outline:'none', caretColor:'#6366f1', overflowY:'auto' }}
          />

          {/* Footer */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:7, fontFamily:'var(--font-mono),monospace', fontSize:8, color:'#94a3b8' }}>
            <span>Auto-saved</span>
            <span>{charCount} chars · {(notes[active]||'').split('\n').filter(Boolean).length} lines</span>
          </div>
        </div>
      </div>
    </div>
  )
}