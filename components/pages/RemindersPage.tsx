'use client'
import { useMemo } from 'react'
import type { Task } from '@/lib/types'
import { getDaysLeft, subColor, TYPE_EMOJI, fmtDate } from '@/lib/utils'
import PageWrapper, { PageTitle } from '@/components/Layout'

interface Props { tasks: Task[] }

function ReminderCard({ task, color }: { task: Task; color: string }) {
  const d    = getDaysLeft(task.deadline)
  const when = d<0?`${Math.abs(d)}d overdue`:d===0?'TODAY':d===1?'Tomorrow':`${d}d left`
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 13px', borderRadius:8, border:`1px solid ${color}25`, background:`${color}06`, borderLeft:`3px solid ${color}` }}>
      <div style={{ fontSize:18, flexShrink:0 }}>{TYPE_EMOJI[task.type]??'📌'}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>{task.title}</div>
        <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
          <span style={{ fontFamily:'var(--font-mono),monospace', fontSize:9, padding:'1px 7px', borderRadius:4, background:`${subColor(task.subject)}18`, color:subColor(task.subject) }}>
            {(task.subject||'—').toUpperCase()}
          </span>
          {task.marks>0&&<span style={{ fontFamily:'var(--font-mono),monospace', fontSize:9, color:'#94a3b8' }}>{task.marks} marks</span>}
          {task.notes&&<span style={{ fontFamily:'var(--font-mono),monospace', fontSize:9, color:'#94a3b8' }}>· {task.notes}</span>}
        </div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontFamily:'var(--font-mono),monospace', fontSize:11, color, fontWeight:700 }}>{when}</div>
        <div style={{ fontFamily:'var(--font-mono),monospace', fontSize:8, color:'#94a3b8', marginTop:2 }}>{fmtDate(task.deadline)}</div>
      </div>
    </div>
  )
}

function Group({ title, icon, color, items }: { title:string; icon:string; color:string; items:Task[] }) {
  if (!items.length) return null
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
        <span style={{ fontSize:13 }}>{icon}</span>
        <span style={{ fontFamily:'var(--font-mono),monospace', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color }}>{title}</span>
        <span style={{ fontFamily:'var(--font-mono),monospace', fontSize:8, color:'#94a3b8', background:'#f8fafc', padding:'1px 7px', borderRadius:20 }}>{items.length}</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {items.map(t=><ReminderCard key={t.id} task={t} color={color}/>)}
      </div>
    </div>
  )
}

export default function RemindersPage({ tasks }: Props) {
  const pending = tasks.filter(t=>!t.done).sort((a,b)=>new Date(a.deadline).getTime()-new Date(b.deadline).getTime())

  const groups = useMemo(()=>{
    const g: Record<string,Task[]> = { overdue:[], today:[], tomorrow:[], thisWeek:[], later:[] }
    pending.forEach(t=>{
      const d=getDaysLeft(t.deadline)
      if      (d<0)  g.overdue.push(t)
      else if (d===0) g.today.push(t)
      else if (d===1) g.tomorrow.push(t)
      else if (d<=7)  g.thisWeek.push(t)
      else            g.later.push(t)
    })
    return g
  },[pending])

  const urgentCount = groups.overdue.length+groups.today.length

  return (
    <PageWrapper maxWidth={1100}>
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <PageTitle>Priority <em style={{ color:'#6366f1', fontStyle:'italic' }}>Reminders</em></PageTitle>
        <div style={{ fontFamily:'var(--font-mono),monospace', fontSize:10, color:'#94a3b8' }}>
          {urgentCount>0?`${urgentCount} task${urgentCount!==1?'s':''} need immediate attention — fix the top first.`:'Nothing critical right now.'}
        </div>
      </div>

      {!pending.length&&(
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:48, marginBottom:14 }}>🎉</div>
          <div style={{ fontFamily:'var(--font-serif),serif', fontSize:'1.4rem', color:'#475569', marginBottom:6 }}>Nothing pending.</div>
          <div style={{ fontFamily:'var(--font-mono),monospace', fontSize:10, color:'#94a3b8' }}>You&apos;re genuinely not cooked. Rare.</div>
        </div>
      )}

      <Group title="Overdue — submit NOW" icon="🚨" color="#dc2626"   items={groups.overdue}  />
      <Group title="Due today"            icon="🔥" color="#6366f1"  items={groups.today}    />
      <Group title="Due tomorrow"         icon="⚡" color="#d97706" items={groups.tomorrow} />
      <Group title="This week"            icon="📅" color="#2563eb"  items={groups.thisWeek} />
      <Group title="Later"               icon="✅" color="#059669" items={groups.later}    />
    </PageWrapper>
  )
}
