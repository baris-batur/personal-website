'use client'

import { useEffect, useState } from 'react'
import { profile } from '@/lib/data'

const nav = [
  { id: 'system', label: 'system' },
  { id: 'stack', label: 'stack' },
  { id: 'homelab', label: 'homelab' },
  { id: 'telemetry', label: 'telemetry' },
  { id: 'work', label: 'work' },
  { id: 'log', label: 'log' },
]

export function StatusBar() {
  const [time, setTime] = useState('--:--:--')
  const [active, setActive] = useState('system')

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour12: false,
          timeZone: 'UTC',
        }),
      )
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const sections = nav
      .map((n) => document.getElementById(n.id))
      .filter(Boolean) as HTMLElement[]
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-11 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="status-dot absolute inline-flex h-2 w-2 rounded-full bg-signal-green" />
          </span>
          <span className="font-mono text-xs font-medium tracking-tight">{profile.slug}</span>
        </a>

        <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
          status · online
        </span>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`rounded px-2.5 py-1 font-mono text-xs transition-colors ${
                active === n.id
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <span className="font-mono text-xs text-muted-foreground font-numeric">
            {time}
            <span className="ml-1 text-[9px] text-muted-foreground/60">UTC</span>
          </span>
          <a
            href="#log"
            className="rounded border border-border px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            contact
          </a>
        </div>
      </div>
    </header>
  )
}
