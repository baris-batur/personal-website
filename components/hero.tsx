'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  profile,
  heroFacts,
  coreStack,
  tickerItems,
  systemNodes,
  heroMetrics,
} from '@/lib/data'
import { ArrowUpRight } from '@/components/icons'
import { useInView } from '@/hooks/use-in-view'

/* ------------------------------------------------------------------ */
/* motion helpers                                                     */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

function useCountUp(to: number, run: boolean, reduced: boolean, duration = 900) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    if (reduced) {
      setN(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(to * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, run, reduced, duration])
  return n
}

/* ------------------------------------------------------------------ */
/* control plane instrument                                           */
/* ------------------------------------------------------------------ */

const VBW = 340
const VBH = 248
const CX = 170
const CY = 122
const R = 92

type Pt = { x: number; y: number }

function ControlPlane({ reduced }: { reduced: boolean }) {
  const [pointer, setPointer] = useState<Pt | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const [heldId, setHeldId] = useState(systemNodes[0].id)
  const rafRef = useRef<number | null>(null)
  const nextRef = useRef<Pt | null>(null)

  // Base positions arranged as an even constellation around the identity node.
  const base = useMemo(() => {
    const step = (Math.PI * 2) / systemNodes.length
    return systemNodes.map((node, i) => {
      const a = -Math.PI / 2 + i * step
      return {
        ...node,
        x: CX + Math.cos(a) * R,
        y: CY + Math.sin(a) * R,
        // radial unit vector for pushing labels outward
        ux: Math.cos(a),
        uy: Math.sin(a),
        depth: 0.5 + i * 0.12,
      }
    })
  }, [])

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduced) return
      const rect = e.currentTarget.getBoundingClientRect()
      nextRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * VBW,
        y: ((e.clientY - rect.top) / rect.height) * VBH,
      }
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null
          setPointer(nextRef.current)
        })
      }
    },
    [reduced],
  )

  const onLeave = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setPointer(null)
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Parallax offset per node — restrained (max ~9px), only while hovering.
  const shift = (depth: number): Pt => {
    if (!pointer) return { x: 0, y: 0 }
    return {
      x: (pointer.x / VBW - 0.5) * 9 * depth,
      y: (pointer.y / VBH - 0.5) * 9 * depth,
    }
  }

  // Nearest node to the cursor. Leaving the frame keeps the last one held.
  const nearestId = useMemo(() => {
    if (!pointer) return null
    let best = base[0].id
    let bestD = Infinity
    for (const node of base) {
      const d = (node.x - pointer.x) ** 2 + (node.y - pointer.y) ** 2
      if (d < bestD) {
        bestD = d
        best = node.id
      }
    }
    return best
  }, [pointer, base])

  useEffect(() => {
    if (nearestId) setHeldId(nearestId)
  }, [nearestId])

  const activeId = pinned ?? nearestId ?? heldId
  const active = systemNodes.find((n) => n.id === activeId) ?? systemNodes[0]
  const activeBase = base.find((n) => n.id === activeId)!
  const activeShift = shift(activeBase.depth)
  const centerShift = shift(0.25)

  // Clamp the cursor-tracking endpoint inside the frame.
  const track = pointer
    ? {
        x: Math.max(12, Math.min(VBW - 12, pointer.x)),
        y: Math.max(12, Math.min(VBH - 12, pointer.y)),
      }
    : null

  return (
    <div>
      <div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative touch-none select-none"
      >
        <div className="pointer-events-none absolute inset-0 dotted-field opacity-40" aria-hidden />
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          className="relative block w-full"
          role="img"
          aria-label={`Interactive map linking ${profile.name.split(' ')[0]} to his engineering domains`}
        >
          {/* static links */}
          {base.map((node) => {
            const s = shift(node.depth)
            const isActive = node.id === activeId
            return (
              <line
                key={`l-${node.id}`}
                x1={CX + centerShift.x}
                y1={CY + centerShift.y}
                x2={node.x + s.x}
                y2={node.y + s.y}
                stroke={isActive ? 'var(--primary)' : 'var(--grid-line)'}
                strokeWidth={isActive ? 1.4 : 1}
                className={isActive && !reduced ? 'link-flow' : undefined}
                opacity={isActive ? 0.9 : 0.55}
              />
            )
          })}

          {/* cursor-tracking hairline — the "control plane reaching toward you" */}
          {track && (
            <>
              <line
                x1={CX + centerShift.x}
                y1={CY + centerShift.y}
                x2={track.x}
                y2={track.y}
                stroke="var(--primary)"
                strokeWidth={1}
                strokeDasharray="2 5"
                opacity={0.5}
              />
              <circle cx={track.x} cy={track.y} r={2.5} fill="var(--primary)" opacity={0.8} />
              <line
                x1={track.x - 6}
                y1={track.y}
                x2={track.x + 6}
                y2={track.y}
                stroke="var(--primary)"
                strokeWidth={0.75}
                opacity={0.4}
              />
              <line
                x1={track.x}
                y1={track.y - 6}
                x2={track.x}
                y2={track.y + 6}
                stroke="var(--primary)"
                strokeWidth={0.75}
                opacity={0.4}
              />
            </>
          )}

          {/* system nodes */}
          {base.map((node) => {
            const s = shift(node.depth)
            const x = node.x + s.x
            const y = node.y + s.y
            const isActive = node.id === activeId
            const anchor = node.ux > 0.25 ? 'start' : node.ux < -0.25 ? 'end' : 'middle'
            const lx = x + node.ux * 15
            const ly = y + node.uy * 15 + (anchor === 'middle' ? (node.uy > 0 ? 9 : -4) : 3)
            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onPointerDown={() => setPinned((p) => (p === node.id ? null : node.id))}
              >
                {/* larger invisible hit target */}
                <circle cx={x} cy={y} r={14} fill="transparent" />
                <rect
                  x={x - 4}
                  y={y - 4}
                  width={8}
                  height={8}
                  fill={isActive ? 'var(--primary)' : 'var(--card)'}
                  stroke={isActive ? 'var(--primary)' : 'var(--border)'}
                  strokeWidth={1}
                  style={{ transition: 'fill .2s, stroke .2s' }}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  className="font-mono"
                  style={{ fontSize: 9, letterSpacing: 0.4 }}
                  fill={isActive ? 'var(--foreground)' : 'var(--muted-foreground)'}
                >
                  {node.label}
                </text>
              </g>
            )
          })}

          {/* identity node */}
          <g>
            {!reduced && (
              <circle
                cx={CX + centerShift.x}
                cy={CY + centerShift.y}
                className="node-ping"
                fill="none"
                stroke="var(--primary)"
                strokeWidth={1}
              />
            )}
            <circle
              cx={CX + centerShift.x}
              cy={CY + centerShift.y}
              r={6}
              fill="var(--primary)"
            />
            <text
              x={CX + centerShift.x}
              y={CY + centerShift.y - 13}
              textAnchor="middle"
              className="font-mono"
              style={{ fontSize: 9, letterSpacing: 0.6 }}
              fill="var(--foreground)"
            >
              {profile.identityLabel}
            </text>
          </g>
        </svg>
      </div>

      {/* live readout for the active domain */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-2.5 font-mono text-[11px]">
        <span className="text-primary">{'>'}</span>
        <span className="text-foreground">{active.label}</span>
        <span className="text-border">::</span>
        <span className="truncate text-muted-foreground">{active.detail}</span>
        <span className="ml-auto shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground/70">
          {pinned ? 'pinned' : pointer ? 'hover' : 'hold'}
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* metrics                                                            */
/* ------------------------------------------------------------------ */

function Metric({
  value,
  label,
  note,
  run,
  reduced,
}: {
  value: number
  label: string
  note: string
  run: boolean
  reduced: boolean
}) {
  const n = useCountUp(value, run, reduced)
  return (
    <div className="px-4 py-3.5">
      <div className="font-mono text-2xl font-medium tabular-nums text-foreground">
        {String(n).padStart(2, '0')}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[10px] text-muted-foreground/70">{note}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* hero                                                               */
/* ------------------------------------------------------------------ */

export function Hero() {
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })

  return (
    <section id="system" className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 grid-field-lg opacity-50" aria-hidden />

      {/* masthead header line */}
      <div className="relative mx-auto max-w-7xl border-b border-border px-4 sm:px-6">
        <div className="flex h-9 items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="text-primary">◢</span> engineering control plane
          </span>
          <span className="hidden sm:inline">{profile.edition}</span>
          <span className="tabular-nums">{profile.coords}</span>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-12 px-4 pb-14 pt-14 sm:px-6 lg:grid-cols-12 lg:pb-20 lg:pt-20">
        {/* editorial column */}
        <div className="lg:col-span-7">
          <div className="reveal in flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
            <span className="uppercase tracking-[0.25em] text-foreground">{profile.role}</span>
            <span className="text-border">/</span>
            <span>{profile.region}</span>
          </div>

          <h1 className="reveal in mt-6 text-balance text-6xl font-medium leading-[0.9] tracking-tight sm:text-7xl lg:text-[5.6rem]">
            {profile.name}
          </h1>

          <p className="reveal in mt-6 max-w-xl text-pretty text-xl leading-tight text-muted-foreground sm:text-2xl">
            {profile.taglinePrefix}{' '}
            {profile.taglineEmphasis.map((word, i, words) => (
              <Fragment key={word}>
                {i === 0 ? '' : i === words.length - 1 ? ', and ' : ', '}
                <span className="text-foreground">{word}</span>
              </Fragment>
            ))}
            .
          </p>

          {/* compact monospace technical metadata */}
          <dl className="reveal in mt-8 grid max-w-lg grid-cols-2 gap-px overflow-hidden rounded border border-border bg-border">
            {heroFacts.map((f) => (
              <div key={f.label} className="bg-background px-3 py-2.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {f.label}
                </dt>
                <dd className="mt-0.5 font-mono text-xs text-foreground">
                  {f.value}
                  {f.sub && <span className="text-muted-foreground"> · {f.sub}</span>}
                </dd>
              </div>
            ))}
          </dl>

          <p className="reveal in mt-7 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
            {profile.summary}
          </p>

          <div className="reveal in mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              className="group inline-flex items-center gap-2 rounded bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              inspect the work
              <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="#log"
              className="inline-flex items-center gap-2 rounded border border-border px-4 py-2.5 font-mono text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {profile.email}
            </a>
          </div>
        </div>

        {/* interactive instrument */}
        <div
          ref={ref}
          className="reveal in lg:col-span-5 lg:pl-8"
          style={{ animationDelay: '120ms' }}
        >
          <div className="plate bg-card/60">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="status-dot h-1.5 w-1.5 rounded-full bg-signal-green" />
                control plane
              </span>
              <span>online</span>
            </div>

            <ControlPlane reduced={reduced} />

            {/* count-up telemetry */}
            <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
              {heroMetrics.map((m) => (
                <Metric key={m.label} {...m} run={inView} reduced={reduced} />
              ))}
            </div>

            {/* core stack — small dense telemetry */}
            <div className="border-t border-border px-4 py-3.5">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                core stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {coreStack.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
              <span className="text-primary">$</span> {profile.compiledLine}
            </div>
          </div>
        </div>
      </div>

      <TelemetryTicker />
    </section>
  )
}

function TelemetryTicker() {
  const doubled = [...tickerItems, ...tickerItems]
  return (
    <div className="relative overflow-hidden border-t border-border bg-card/30">
      <div className="marquee-track flex w-max whitespace-nowrap">
        {doubled.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-2 px-5 py-2 font-mono text-[11px] text-muted-foreground"
          >
            <span className="text-primary/70">▸</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
