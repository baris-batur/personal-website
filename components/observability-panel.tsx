'use client'

import { latencySeries, trafficSeries, gauges } from '@/lib/data'
import { AreaChart, BarHistogram, SloArc } from '@/components/charts'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { useInView } from '@/hooks/use-in-view'

export function ObservabilityPanel() {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <Section index="01" label="signals" field="grid">
      <SectionHeading kicker="interface study" title="Signals" spec="fig.01 · synthetic">
        An observability interface I designed for this site — a small study in making telemetry
        readable. The series below are illustrative shapes, not measurements from any live system.
      </SectionHeading>

      <Reveal>
        <figure className="plate bg-card/40">
          <figcaption className="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span>fig.01 — observability specimen</span>
            <span className="text-signal-amber">synthetic data</span>
          </figcaption>

          <div ref={ref} className="grid grid-cols-1 lg:grid-cols-12">
            {/* time series */}
            <div className="border-b border-border p-5 lg:col-span-8 lg:border-b-0 lg:border-r">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                sample series · arbitrary units
              </div>
              {inView && <AreaChart series={latencySeries} animate unit="" height={210} />}
            </div>

            {/* gauges */}
            <div className="p-5 lg:col-span-4">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                sample gauges
              </div>
              <ul className="space-y-4">
                {gauges.map((g) => (
                  <li key={g.name} className="flex items-center gap-3">
                    <SloArc value={g.value} />
                    <div className="min-w-0 font-mono text-xs text-muted-foreground">{g.name}</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* distribution */}
            <div className="border-t border-border p-5 lg:col-span-12">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                sample distribution
              </div>
              <BarHistogram series={trafficSeries} height={110} />
            </div>
          </div>
        </figure>
      </Reveal>
    </Section>
  )
}
