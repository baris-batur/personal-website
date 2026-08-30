'use client'

import { useMemo, useState } from 'react'
import {
  homelabNodes,
  homelabEdges,
  homelabTierLabels,
  homelabTierColor as tierColor,
  homelabPlanColor as planColor,
  homelabPlanLabel as planLabel,
  type HomelabTier,
} from '@/lib/data'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'

const NW = 132
const NH = 50

export function HomelabTopology() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)

  const activeId = pinned ?? hovered
  const active = homelabNodes.find((n) => n.id === activeId) ?? null

  // Adjacency: which nodes/edges are connected to the active node.
  const neighbors = useMemo(() => {
    const set = new Set<string>()
    if (!activeId) return set
    set.add(activeId)
    homelabEdges.forEach((e) => {
      if (e.from === activeId) set.add(e.to)
      if (e.to === activeId) set.add(e.from)
    })
    return set
  }, [activeId])

  const nodeById = useMemo(
    () => Object.fromEntries(homelabNodes.map((n) => [n.id, n])),
    [],
  )

  const isDim = (id: string) => activeId !== null && !neighbors.has(id)
  const isEdgeActive = (from: string, to: string) =>
    activeId !== null && (from === activeId || to === activeId)

  const select = (id: string) =>
    setPinned((p) => (p === id ? null : id))

  return (
    <Section id="homelab" index="03" label="homelab" field="grid">
      <SectionHeading
        kicker="reference architecture · planned"
        title="The homelab I'm building"
        spec="hover to trace"
      >
        A self-hosted Kubernetes cluster I&apos;m setting up on hardware I own, to run this site, a
        media server, and (maybe) file hosting, instead of leaning on managed cloud. Hover any node
        to trace how a request moves through it.{' '}
        <span className="text-signal-amber">Planned architecture, not yet in production.</span>
      </SectionHeading>

      <Reveal>
        <div className="plate bg-card/40">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span>fig.02 · homelab topology</span>
            <span className="text-signal-amber">planned · not live</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* diagram */}
            <div
              className="border-b border-border lg:col-span-8 lg:border-b-0 lg:border-r"
              onMouseLeave={() => setHovered(null)}
            >
              <div className="overflow-x-auto p-4">
                <svg
                  viewBox="0 0 700 500"
                  className="h-auto w-full min-w-[600px]"
                  role="group"
                  aria-label="Planned homelab Kubernetes architecture. Interactive node diagram."
                >
                  <defs>
                    <marker
                      id="hl-arrow"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M0 0 10 5 0 10z" fill="var(--muted-foreground)" />
                    </marker>
                    <marker
                      id="hl-arrow-on"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6.5"
                      markerHeight="6.5"
                      orient="auto-start-reverse"
                    >
                      <path d="M0 0 10 5 0 10z" fill="var(--signal-amber)" />
                    </marker>
                  </defs>

                  {/* edges */}
                  {homelabEdges.map((e) => {
                    const a = nodeById[e.from]
                    const b = nodeById[e.to]
                    const on = isEdgeActive(e.from, e.to)
                    const dim = activeId !== null && !on
                    const mx = (a.x + b.x) / 2
                    const my = (a.y + b.y) / 2
                    return (
                      <g key={`${e.from}-${e.to}`} opacity={dim ? 0.15 : 1}>
                        <line
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke={on ? tierColor[a.tier] : 'var(--border)'}
                          strokeWidth={on ? 1.5 : 1}
                          markerEnd={`url(#${on ? 'hl-arrow-on' : 'hl-arrow'})`}
                          className={on ? 'flow-line' : ''}
                          style={on ? { stroke: tierColor[a.tier] } : undefined}
                        />
                        {on && (
                          <g>
                            <rect
                              x={mx - 22}
                              y={my - 8}
                              width={44}
                              height={16}
                              fill="var(--background)"
                              stroke="var(--border)"
                            />
                            <text
                              x={mx}
                              y={my + 3}
                              textAnchor="middle"
                              className="font-mono"
                              fontSize={8}
                              letterSpacing="0.06em"
                              fill="var(--muted-foreground)"
                            >
                              {e.label}
                            </text>
                          </g>
                        )}
                      </g>
                    )
                  })}

                  {/* nodes */}
                  {homelabNodes.map((n) => {
                    const on = n.id === activeId
                    const dim = isDim(n.id)
                    const color = tierColor[n.tier]
                    return (
                      <g
                        key={n.id}
                        transform={`translate(${n.x - NW / 2} ${n.y - NH / 2})`}
                        role="button"
                        tabIndex={0}
                        aria-label={`${n.label}: ${planLabel[n.plan]}. ${n.detail}`}
                        aria-pressed={pinned === n.id}
                        className="cursor-pointer outline-none"
                        opacity={dim ? 0.4 : 1}
                        onMouseEnter={() => setHovered(n.id)}
                        onFocus={() => setHovered(n.id)}
                        onBlur={() => setHovered(null)}
                        onClick={() => select(n.id)}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter' || ev.key === ' ') {
                            ev.preventDefault()
                            select(n.id)
                          }
                        }}
                      >
                        {on && (
                          <circle
                            cx={NW / 2}
                            cy={NH / 2}
                            r={6}
                            fill={color}
                            className="topo-pulse"
                          />
                        )}
                        <rect
                          x={0}
                          y={0}
                          width={NW}
                          height={NH}
                          rx={2}
                          fill="var(--card)"
                          stroke={on ? color : 'var(--border)'}
                          strokeWidth={on ? 1.5 : 1}
                        />
                        {/* tier accent bar */}
                        <rect x={0} y={0} width={3} height={NH} rx={1} fill={color} />
                        <circle cx={NW - 12} cy={12} r={2.5} fill={planColor[n.plan]} />
                        <text
                          x={14}
                          y={22}
                          className="font-mono"
                          fontSize={11}
                          fontWeight={500}
                          fill="var(--foreground)"
                        >
                          {n.label}
                        </text>
                        <text
                          x={14}
                          y={37}
                          className="font-mono"
                          fontSize={8.5}
                          letterSpacing="0.04em"
                          fill="var(--muted-foreground)"
                        >
                          {n.sub}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* legend */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                {(Object.keys(homelabTierLabels) as HomelabTier[]).map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2"
                      style={{ background: tierColor[t] }}
                      aria-hidden
                    />
                    {homelabTierLabels[t]}
                  </span>
                ))}
              </div>
            </div>

            {/* readout */}
            <div className="flex flex-col lg:col-span-4">
              <div className="border-b border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                node.inspect
              </div>

              <div className="flex-1 p-4">
                {active ? (
                  <div key={active.id} className="hop-in">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-mono text-sm font-medium text-foreground">
                        {active.label}
                      </h3>
                      <span
                        className="shrink-0 border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                        style={{
                          color: planColor[active.plan],
                          borderColor: planColor[active.plan],
                        }}
                      >
                        {planLabel[active.plan]}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      <span
                        className="inline-block h-1.5 w-1.5"
                        style={{ background: tierColor[active.tier] }}
                        aria-hidden
                      />
                      {homelabTierLabels[active.tier]}
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {active.detail}
                    </p>

                    <div className="mt-4 border-t border-border pt-3">
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        planned tooling
                      </div>
                      <div className="mt-1.5 font-mono text-xs text-foreground">{active.tech}</div>
                    </div>
                  </div>
                ) : (
                  <div className="font-mono text-xs leading-relaxed text-muted-foreground">
                    <p className="text-foreground">{homelabNodes.length} nodes · one cluster.</p>
                    <p className="mt-3">
                      Hover or focus a node to inspect it and trace its connections. Tap to pin on
                      touch devices.
                    </p>
                    <p className="mt-3">
                      Everything here is <span className="text-signal-amber">planned</span> unless a
                      node is marked otherwise. This is the target, not the current state.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                <span className="text-signal-amber">roadmap</span> · self-hosted infra
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
