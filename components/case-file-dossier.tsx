'use client'

import { useEffect, useRef } from 'react'
import { projectStatusColor, type Project } from '@/lib/data'
import { ArrowUpRight } from '@/components/icons'

export function CaseFileDossier({ project, onClose }: { project: Project; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Lock scroll, focus the panel, close on Escape, trap focus loosely.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const cf = project.caseFile

  return (
    <div
      className="dossier-backdrop fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
        onClick={(e) => e.stopPropagation()}
        className="dossier-panel relative my-auto w-full max-w-4xl border border-border bg-card"
      >
        {/* report header bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card/95 px-5 py-3 backdrop-blur sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
              {project.id}
            </span>
            <span className="h-3.5 w-px bg-border" />
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: projectStatusColor[project.status] }}
              />
              {project.status}
            </span>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close case file"
          >
            close
            <span aria-hidden className="text-sm leading-none">
              ✕
            </span>
          </button>
        </header>

        <div className="px-5 py-6 sm:px-7 sm:py-8">
          {/* title block */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-primary">{project.kind}</div>
              <h2
                id="dossier-title"
                className="mt-1 text-3xl font-medium tracking-tight sm:text-4xl"
              >
                {project.name}
              </h2>
            </div>
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 border border-border px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {project.href.includes('github') ? 'view source' : 'view project'}
                <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>

          {/* problem / built — the lede */}
          <div className="mt-7 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
            <Field label="the problem" tone="var(--signal-red)">
              {cf.problem}
            </Field>
            <Field label="what I built" tone="var(--signal-green)">
              {cf.built}
            </Field>
          </div>

          {/* architecture flow */}
          <SubHead n="01" title="architecture" />
          <ArchitectureFlow steps={cf.architecture} />

          {/* technical approach */}
          <SubHead n="02" title="technical approach" />
          <ol className="mt-4 space-y-2.5">
            {cf.approach.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-0.5 font-mono text-[11px] text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ol>

          {/* decisions + challenges, two columns */}
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <SubHead n="03" title="key decisions" flush />
              <dl className="mt-4 space-y-4">
                {cf.decisions.map((d, i) => (
                  <div key={i} className="border-l border-primary/40 pl-3">
                    <dt className="text-sm font-medium text-foreground">{d.choice}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {d.rationale}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <SubHead n="04" title="challenges" flush />
              <ul className="mt-4 space-y-3">
                {cf.challenges.map((c, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal-amber" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* result */}
          <SubHead n="05" title="result" />
          <div className="mt-4 border border-border bg-secondary/40 p-5">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: cf.outcomeKind === 'quant' ? 'var(--signal-cyan)' : 'var(--signal-green)',
                }}
              />
              {cf.outcomeKind === 'quant' ? 'measured outcome' : 'qualitative outcome'}
            </div>
            <p className="text-sm leading-relaxed text-foreground">{cf.outcome}</p>
          </div>

          {/* tech tags */}
          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  tone,
  children,
}: {
  label: string
  tone: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-card p-5">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
        {label}
      </div>
      <p className="text-sm leading-relaxed text-foreground">{children}</p>
    </div>
  )
}

function SubHead({ n, title, flush }: { n: string; title: string; flush?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${flush ? '' : 'mt-9'}`}>
      <span className="font-mono text-[11px] text-primary">{n}</span>
      <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-foreground">{title}</h3>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

function ArchitectureFlow({ steps }: { steps: { step: string; note: string }[] }) {
  return (
    <div className="mt-4 flex flex-col gap-2 overflow-x-auto sm:flex-row sm:items-stretch">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2 sm:flex-1">
          <div
            className="flow-step w-full border border-border bg-secondary/40 p-3"
            style={{ animationDelay: `${i * 110}ms` }}
          >
            <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="mt-1 text-sm font-medium tracking-tight text-foreground">{s.step}</div>
            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{s.note}</div>
          </div>
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className="flow-step shrink-0 self-center font-mono text-primary sm:rotate-0"
              style={{ animationDelay: `${i * 110 + 55}ms` }}
            >
              →
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
