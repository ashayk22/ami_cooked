'use client'
import { useMemo } from 'react'
import type { Task } from '@/lib/types'
import PageWrapper, { Panel, PanelHeader, PanelBody, PageTitle } from '@/components/Layout'

interface Props { tasks: Task[] }

export default function StreaksPage({ tasks }: Props) {
  const done = tasks.filter(t => t.done)

  const streak = useMemo(() => {
    const days = new Set(done.map(t => t.created?.split('T')[0]))
    let s = 0; const d = new Date()
    while (true) {
      const key = d.toISOString().split('T')[0]
      if (days.has(key)) { s++; d.setDate(d.getDate()-1) } else break
    }
    return s
  }, [done])

  const last7 = useMemo(() => Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-6+i)
    const key = d.toISOString().split('T')[0]
    return { label:['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], count:done.filter(t=>t.created?.startsWith(key)).length, isToday:i===6 }
  }), [done])

  const maxCount   = Math.max(...last7.map(d=>d.count), 1)
  const totalMarks = done.reduce((a,t)=>a+(t.marks||0), 0)

  return (
    <PageWrapper maxWidth={1100}>
      <PageTitle>Progress & <em style={{ color:'#6366f1', fontStyle:'italic' }}>Streaks</em></PageTitle>

      {/* Stat row — 1 col on mobile, 3 on md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {[
          { icon:'🔥', label:'Current streak',  val:streak+(streak===1?' day':' days'), color:'#6366f1'  },
          { icon:'✅', label:'Tasks completed',  val:done.length,                        color:'#059669' },
          { icon:'📈', label:'Marks cleared',    val:totalMarks,                         color:'#2563eb'  },
        ].map(s=>(
          <div key={s.label} style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderLeft:`3px solid ${s.color}`, borderRadius:9, padding:'14px 16px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ fontSize:26 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily:'var(--font-mono),monospace', fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:24, fontWeight:800, color:s.color, lineHeight:1, letterSpacing:'-0.03em' }}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts — 1 col on mobile, 2 on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" style={{ alignItems:'start' }}>

        <Panel>
          <PanelHeader><div style={{ fontSize:12, fontWeight:700 }}>Last 7 days</div></PanelHeader>
          <PanelBody>
            <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:90, marginBottom:6 }}>
              {last7.map((d,i)=>(
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end' }}>
                  {d.count>0&&<div style={{ fontFamily:'var(--font-mono),monospace', fontSize:8, color:d.isToday?'#6366f1':'#94a3b8' }}>{d.count}</div>}
                  <div style={{ width:'100%', borderRadius:3, background:d.count>0?(d.isToday?'#6366f1':'#818cf8'):'#f8fafc', height:Math.max(5,Math.round((d.count/maxCount)*72))+'px', transition:'height 0.5s ease' }} />
                  <div style={{ fontFamily:'var(--font-mono),monospace', fontSize:8, color:d.isToday?'#6366f1':'#94a3b8', fontWeight:d.isToday?700:400 }}>{d.label}</div>
                </div>
              ))}
            </div>
            {last7.every(d=>d.count===0)&&<div style={{ textAlign:'center', fontFamily:'var(--font-mono),monospace', fontSize:9, color:'#94a3b8' }}>Complete a task to start your streak!</div>}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader><div style={{ fontSize:12, fontWeight:700 }}>Recently completed</div></PanelHeader>
          <PanelBody style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {done.slice(-6).reverse().map(t=>(
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 9px', background:'#e2e8f0', borderRadius:6, border:'1px solid #e2e8f0' }}>
                <span style={{ color:'#059669', fontSize:11, flexShrink:0 }}>✓</span>
                <div style={{ flex:1, fontSize:11, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>
                {t.marks>0&&<span style={{ fontFamily:'var(--font-mono),monospace', fontSize:9, color:'#94a3b8', flexShrink:0 }}>{t.marks}m</span>}
              </div>
            ))}
            {!done.length&&<div style={{ textAlign:'center', padding:'16px 0', fontFamily:'var(--font-mono),monospace', fontSize:10, color:'#94a3b8' }}>Complete your first task!</div>}
          </PanelBody>
        </Panel>
      </div>

      {/* Motivational banner */}
      <div style={{ background:streak>0?'linear-gradient(90deg,rgba(96,200,255,0.15),rgba(64,224,160,0.08))':'#ffffff', border:`1px solid ${streak>0?'#6366f1':'#e2e8f0'}`, borderRadius:10, padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ fontSize:36, flexShrink:0 }}>{streak>=7?'🏆':streak>=3?'🔥':streak>0?'⚡':'😴'}</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>
            {streak>=7?`${streak}-day streak. Absolute unit.`:streak>=3?`${streak} days in a row. Keep going.`:streak===1?'Day 1. Come back tomorrow.':'No streak yet. Submit something today.'}
          </div>
          <div style={{ fontFamily:'var(--font-mono),monospace', fontSize:10, color:'#94a3b8' }}>
            {streak>0?`${done.length} task${done.length!==1?'s':''} completed · ${totalMarks} marks cleared`:'Mark a task as done to start your streak.'}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}