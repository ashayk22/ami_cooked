import React from 'react'

export default function PageWrapper({
  children,
  maxWidth = 1100,
}: {
  children: React.ReactNode
  maxWidth?: number
}) {
  return (
    <div style={{ maxWidth, margin: '0 auto' }} className="px-3 sm:px-4 md:px-5 py-4 md:py-6 space-y-4 md:space-y-5">
      {children}
    </div>
  )
}

export function PageHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-2">{children}</div>
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{children}</h1>
}

export function PageSubtitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs md:text-sm font-medium text-slate-500 mt-0.5">{children}</p>
}

export function Panel({
  children, style, className = '',
}: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string
}) {
  return (
    <div className={`card ${className}`} style={{ position: 'relative', zIndex: 2, isolation: 'isolate', ...style }}>
      {children}
    </div>
  )
}

export function PanelHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 border-b-2 border-slate-200 bg-slate-50 ${className}`}>
      {children}
    </div>
  )
}

export function PanelBody({
  children, style, className = '',
}: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string
}) {
  return <div className={`px-3 md:px-4 py-3 ${className}`} style={style}>{children}</div>
}

export function StatCard({
  label, value, color = '#6366f1', icon, sub,
}: {
  label: string; value: string | number; color?: string; icon?: React.ReactNode; sub?: string
}) {
  return (
    <div className="card px-3 md:px-4 py-3 flex items-center gap-2.5 md:gap-3" style={{ position: 'relative', zIndex: 2, isolation: 'isolate' }}>
      {icon && (
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      )}
      <div>
        <p className="text-xl md:text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 md:mb-3">{children}</p>
}
