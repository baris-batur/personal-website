import type { ReactNode } from 'react'
import { Reveal } from '@/components/reveal'

export function SectionHeading({
  kicker,
  title,
  spec,
  children,
}: {
  kicker: string
  title: string
  spec?: string
  children?: ReactNode
}) {
  return (
    <div className="mb-12">
      <Reveal>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 bg-primary" aria-hidden />
            {kicker}
          </div>
          {spec && (
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
              {spec}
            </span>
          )}
        </div>
        <h2 className="mt-4 max-w-2xl text-balance text-4xl font-medium leading-[1.03] tracking-tight sm:text-5xl">
          {title}
        </h2>
        {children && (
          <div className="mt-5 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        )}
      </Reveal>
    </div>
  )
}
