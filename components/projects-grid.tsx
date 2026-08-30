'use client'

import { useState } from 'react'
import { projects, projectStatusColor, type Project } from '@/lib/data'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { ArrowUpRight } from '@/components/icons'
import { CaseFileDossier } from '@/components/case-file-dossier'

export function ProjectsGrid() {
  const [open, setOpen] = useState<Project | null>(null)
  const feature = projects.find((p) => p.feature) ?? projects[0]
  const rest = projects.filter((p) => p !== feature)

  return (
    <Section id="work" index="05" label="work" field="dotted">
      <SectionHeading
        kicker="engineering case files"
        title="Selected work"
        spec={`${projects.length} files`}
      >
        Each project is a short case file: the problem, what I built, the technical approach, and
        the outcome. Open one to read the full report.
      </SectionHeading>

      {/* asymmetric case-file layout: large feature spanning, varied rest */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
        <Reveal className="md:col-span-6">
          <FeatureFile p={feature} onOpen={() => setOpen(feature)} />
        </Reveal>

        {rest.map((p, i) => {
          // Vary footprint so it doesn't read as identical cards.
          const span = i === 0 ? 'md:col-span-4' : i === 1 ? 'md:col-span-2' : i === 3 ? 'md:col-span-4' : 'md:col-span-2'
          return (
            <Reveal key={p.id} delay={i * 60} className={span}>
              <CaseFile p={p} n={i + 2} onOpen={() => setOpen(p)} />
            </Reveal>
          )
        })}
      </div>

      {open && <CaseFileDossier project={open} onClose={() => setOpen(null)} />}
    </Section>
  )
}

function InspectCue() {
  return (
    <span className="pointer-events-none absolute bottom-4 right-4 flex translate-y-1 items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
      inspect
      <span aria-hidden>→</span>
    </span>
  )
}

function StatusTag({ status }: { status: Project['status'] }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: projectStatusColor[status] }} />
      {status}
    </span>
  )
}

function Tags({ tags, max }: { tags: string[]; max?: number }) {
  const shown = max ? tags.slice(0, max) : tags
  const extra = max ? tags.length - shown.length : 0
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((t) => (
        <span
          key={t}
          className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
        >
          {t}
        </span>
      ))}
      {extra > 0 && (
        <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          +{extra}
        </span>
      )}
    </div>
  )
}

/* The featured case file — larger, shows a problem→build preview split. */
function FeatureFile({ p, onOpen }: { p: Project; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label={`Open case file: ${p.name}`}
      className="group relative block w-full overflow-hidden border border-border bg-card/40 p-6 text-left transition-colors hover:border-primary/50 focus:outline-none focus-visible:border-primary/60 sm:p-8"
    >
      <div
        className="pointer-events-none absolute inset-0 grid-field opacity-0 transition-opacity duration-500 group-hover:opacity-40"
        aria-hidden
      />
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
          {p.id} · featured file
        </span>
        <StatusTag status={p.status} />
      </div>

      <div className="relative mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h3 className="text-3xl font-medium tracking-tight sm:text-4xl">{p.name}</h3>
          <div className="mt-1 font-mono text-xs text-primary">{p.kind}</div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-red" />
                the problem
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                {p.caseFile.problem}
              </p>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-green" />
                what I built
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-foreground">{p.caseFile.built}</p>
            </div>
          </div>

          <div className="mt-5">
            <Tags tags={p.tags} />
          </div>
        </div>

        {/* mini architecture preview */}
        <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            architecture
          </div>
          <ol className="mt-3 space-y-1.5">
            {p.caseFile.architecture.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-foreground">{s.step}</span>
                {i < p.caseFile.architecture.length - 1 && (
                  <span aria-hidden className="ml-auto font-mono text-[10px] text-border">
                    ↓
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <InspectCue />
    </button>
  )
}

/* A compact case file — problem-forward, opens the full report on click. */
function CaseFile({ p, n, onOpen }: { p: Project; n: number; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label={`Open case file: ${p.name}`}
      className="group relative flex h-full w-full flex-col overflow-hidden border border-border bg-card/40 p-5 text-left transition-colors hover:border-primary/50 focus:outline-none focus-visible:border-primary/60"
    >
      <div
        className="pointer-events-none absolute inset-0 dotted-field opacity-0 transition-opacity duration-500 group-hover:opacity-50"
        aria-hidden
      />
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted-foreground">
          {p.id}
        </span>
        <StatusTag status={p.status} />
      </div>

      <h3 className="relative mt-3 text-xl font-medium tracking-tight transition-colors group-hover:text-primary">
        {p.name}
      </h3>
      <div className="relative mt-0.5 font-mono text-xs text-primary">{p.kind}</div>

      <div className="relative mt-4 flex items-start gap-2">
        <span
          aria-hidden
          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-red"
        />
        <p className="text-sm leading-relaxed text-muted-foreground">{p.caseFile.problem}</p>
      </div>

      <div className="relative mt-auto pt-5">
        <Tags tags={p.tags} max={4} />
      </div>

      <InspectCue />
    </button>
  )
}
