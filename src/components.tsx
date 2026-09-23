import type { ReactNode } from 'react'

export function Stat({ value, label, note, tone }: { value: ReactNode; label: string; note?: string; tone?: 'warn' | 'good' | 'plain' }) {
  return (
    <div className={`stat ${tone ?? 'plain'}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  )
}

export function Bar({ value, max, tone }: { value: number; max: number; tone?: 'a' | 'b' | 'muted' }) {
  const w = max ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <span className="bar">
      <span className={`bar-fill ${tone ?? 'a'}`} style={{ width: `${w}%` }} />
    </span>
  )
}

export function Chip({ children, tone }: { children: ReactNode; tone?: 'ok' | 'warn' | 'bad' | 'info' | 'muted' }) {
  return <span className={`chip ${tone ?? 'muted'}`}>{children}</span>
}

export function Section({ title, lead, children }: { title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </section>
  )
}
