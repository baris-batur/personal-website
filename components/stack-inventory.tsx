'use client'

import { stack } from '@/lib/data'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'

const levelSegments: Record<string, number> = {
  core: 4,
  strong: 3,
  familiar: 2,
  learning: 1,
}

export function StackInventory() {
  return (
    <Section id="stack" index="02" label="stack" field="dotted">
      <SectionHeading kicker="toolchain" title="Working stack" spec={`${stack.length} domains`}>
        The tooling I actually reach for across work, coursework, and side projects. Familiarity is
        a self-assessment, not a metric.
      </SectionHeading>

      <Reveal>
        <div className="border-t border-border">
          {/* header row */}
          <div className="hidden grid-cols-12 gap-4 border-b border-border py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:grid">
            <span className="col-span-1">#</span>
            <span className="col-span-2">domain</span>
            <span className="col-span-3">primary</span>
            <span className="col-span-3">toolchain</span>
            <span className="col-span-2">familiarity</span>
            <span className="col-span-1 text-right">context</span>
          </div>

          {stack.map((row, i) => (
            <StackRowItem key={row.domain} row={row} index={i} />
          ))}
        </div>
      </Reveal>
    </Section>
  )
}

function StackRowItem({ row, index }: { row: (typeof stack)[number]; index: number }) {
  const filled = levelSegments[row.level]

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-border py-4 transition-colors hover:bg-card/40 md:grid-cols-12 md:items-center md:py-3.5">
      <div className="col-span-1 hidden font-mono text-[11px] text-muted-foreground md:block">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="col-span-1 md:col-span-2">
        <span className="font-mono text-sm text-foreground">{row.domain}</span>
      </div>

      <div className="col-span-1 md:col-span-3">
        <span className="text-sm font-medium">{row.primary}</span>
      </div>

      <div className="col-span-2 flex flex-wrap gap-1.5 md:col-span-3">
        {row.tools.map((t) => (
          <span
            key={t}
            className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="col-span-1 flex items-center gap-3 md:col-span-2">
        <div className="flex flex-1 gap-1" aria-hidden>
          {[0, 1, 2, 3].map((s) => (
            <span
              key={s}
              className="h-2 flex-1"
              style={{
                background: s < filled ? 'var(--primary)' : 'var(--secondary)',
              }}
            />
          ))}
        </div>
        <span className="w-16 shrink-0 font-mono text-[10px] text-muted-foreground">
          {row.level}
        </span>
      </div>

      <div className="col-span-1 flex items-center md:col-span-1 md:justify-end">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {row.context}
        </span>
      </div>
    </div>
  )
}
