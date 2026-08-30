'use client'

import { useEffect, useState } from 'react'
import {
  telemetry,
  metricDefs,
  timeRanges,
  formatMetric,
  formatAxis,
  formatUptime,
  resolveTelemetryStatus,
  telemetryStatusCopy,
  telemetryStatusDetail,
  type MetricId,
  type TimeRangeId,
  type MetricSnapshot,
  type TelemetrySnapshot,
  type TelemetryStatus,
} from '@/lib/telemetry'
import { Sparkline } from '@/components/charts'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { useInView } from '@/hooks/use-in-view'

export function ServerTelemetry() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [range, setRange] = useState<TimeRangeId>('24h')
  const [metricId, setMetricId] = useState<MetricId>('cpu')
  const [snap, setSnap] = useState<TelemetrySnapshot | null>(null)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false
    telemetry.fetchSnapshot(range).then(
      (s) => {
        if (cancelled) return
        setSnap(s)
        setFetchFailed(false)
        setHover(null)
      },
      () => {
        if (cancelled) return
        // Keep the last snapshot. Never substitute development data.
        setFetchFailed(true)
      },
    )
    return () => {
      cancelled = true
    }
  }, [range])

  const viewSnap = snap?.range === range ? snap : null
  const status = resolveTelemetryStatus({
    sourceMode: telemetry.mode,
    snap: viewSnap,
    fetchFailed,
    now,
  })

  useEffect(() => {
    if (telemetry.mode !== 'live') return
    const id = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(id)
  }, [])

  const def = metricDefs.find((d) => d.id === metricId)!
  const metric = viewSnap?.metrics[metricId] ?? null
  const n = metric?.points.length ?? 0
  const activeIndex = hover ?? (n > 0 ? n - 1 : 0)
  const activePoint = metric?.points[activeIndex] ?? null
  const hovering = hover !== null
  const showSeries = status !== 'offline'
  const provenance = provenanceLine(status)

  return (
    <Section id="telemetry" index="04" label="telemetry" field="grid">
      <SectionHeading
        kicker="self-hosted infrastructure"
        title="Server telemetry"
        spec={`fig.03 · ${status === 'development' ? 'development' : status}`}
      >
        {telemetry.mode === 'development' ? (
          <>
            A monitoring panel I built for my own box, reading through a typed telemetry adapter. It
            renders <span className="text-primary">development data</span>, generated locally, never
            a live measurement.
          </>
        ) : (
          <>
            A monitoring panel I built for my own box, reading through a typed telemetry adapter.
            Freshness is labelled explicitly: live, delayed, or offline. A failed scrape never
            falls back to generated series.
          </>
        )}
      </SectionHeading>

      <Reveal>
        <figure className="plate bg-card/40">
          <figcaption className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border px-4 py-2.5">
            <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <span className="text-primary">◢</span>
              <span className="text-foreground">
                {viewSnap?.host.hostname ?? '-'}
                <span className="text-muted-foreground">@self-hosted</span>
              </span>
              <span className="hidden sm:inline text-border">│</span>
              <span className="hidden sm:inline">
                {viewSnap?.host.os ?? (status === 'offline' ? 'unavailable' : 'connecting…')}
              </span>
              <span className="hidden md:inline text-border">│</span>
              <span className="hidden md:inline">{viewSnap?.host.region ?? ''}</span>
            </div>

            <TelemetryStatusBadge status={status} snap={viewSnap} now={now} pulse={inView} />
          </figcaption>

          <div ref={ref} className="grid grid-cols-2 border-b border-border sm:grid-cols-3 lg:grid-cols-6">
            {metricDefs.map((d, i) => {
              const ms = showSeries ? (viewSnap?.metrics[d.id] ?? null) : null
              const selected = d.id === metricId
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setMetricId(d.id)
                    setHover(null)
                  }}
                  aria-pressed={selected}
                  aria-label={`${d.label}, current ${ms ? formatMetric(d, ms.current) : 'unavailable'}`}
                  className={[
                    'group relative flex flex-col gap-2 border-border p-3 text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                    i % 2 === 0 ? 'border-r' : '',
                    i < 4 ? 'border-b sm:border-b' : '',
                    'sm:[&:not(:nth-child(3n))]:border-r lg:[&:not(:nth-child(6n))]:border-r',
                    'sm:[&:nth-child(-n+3)]:border-b lg:[&:nth-child(-n+6)]:border-b',
                    selected ? 'bg-card' : 'hover:bg-card/60',
                  ].join(' ')}
                >
                  {selected && (
                    <span
                      className="absolute left-0 top-0 h-full w-0.5"
                      style={{ background: d.color }}
                      aria-hidden
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: selected ? d.color : undefined }}
                    >
                      {d.short}
                    </span>
                    <span
                      className="h-1.5 w-1.5 rounded-sm opacity-70"
                      style={{ background: d.color }}
                      aria-hidden
                    />
                  </div>
                  <div className="font-mono text-lg tabular-nums text-foreground">
                    {ms ? ms.current.toFixed(d.decimals) : '––'}
                    <span className="ml-0.5 text-[10px] text-muted-foreground">{d.unit}</span>
                  </div>
                  <div className="h-[26px]">
                    {ms && inView && (
                      <Sparkline
                        series={ms.points.map((p) => p.v)}
                        color={d.color}
                        width={150}
                        height={26}
                        fill={selected}
                      />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="border-b border-border p-5 lg:col-span-8 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="h-2 w-2 rounded-sm" style={{ background: def.color }} aria-hidden />
                  <span className="text-foreground">{def.label}</span>
                  <span className="text-muted-foreground">/ {range}</span>
                </div>
                <div
                  className="flex items-center overflow-hidden rounded border border-border"
                  role="group"
                  aria-label="Select time range"
                >
                  {timeRanges.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRange(r.id)}
                      aria-pressed={r.id === range}
                      className={`px-2.5 py-1 font-mono text-[11px] transition-colors ${
                        r.id === range
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {metric && showSeries ? (
                <MetricChart
                  metric={metric}
                  range={range}
                  color={def.color}
                  unit={def.unit}
                  decimals={def.decimals}
                  animate={inView}
                  activeIndex={activeIndex}
                  onHover={setHover}
                  status={status}
                />
              ) : (
                <div className="flex h-[220px] items-center justify-center font-mono text-xs text-muted-foreground">
                  {status === 'offline' ? 'telemetry unavailable' : 'connecting to telemetry adapter…'}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-5 p-5 lg:col-span-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {hovering ? 'value at cursor' : 'current'}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl tabular-nums text-foreground">
                    {metric && showSeries && activePoint ? activePoint.v.toFixed(def.decimals) : '––'}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">{def.unit || 'load'}</span>
                </div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {metric && showSeries && activePoint ? `@ ${formatAxis(activePoint.t, range)}` : ''}{' '}
                  {seriesKindLabel(status, hovering)}
                </div>
              </div>

              <dl className="grid grid-cols-3 gap-px overflow-hidden rounded border border-border bg-border">
                <Stat label="min" value={metric && showSeries ? metric.min.toFixed(def.decimals) : '––'} />
                <Stat label="avg" value={metric && showSeries ? metric.avg.toFixed(def.decimals) : '––'} />
                <Stat label="max" value={metric && showSeries ? metric.max.toFixed(def.decimals) : '––'} />
              </dl>

              <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                {def.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <span>
                uptime{' '}
                <span className="text-foreground normal-case tracking-normal">
                  {viewSnap && showSeries ? formatUptime(viewSnap.host.uptimeSeconds) : '-'}
                </span>
              </span>
              <span>
                load{' '}
                <span className="text-foreground normal-case tracking-normal tabular-nums">
                  {viewSnap && showSeries ? viewSnap.metrics.load.current.toFixed(2) : '-'}
                </span>
              </span>
            </div>
            <span
              className={
                status === 'live'
                  ? 'text-signal-green'
                  : status === 'offline'
                    ? 'text-muted-foreground'
                    : 'text-signal-amber'
              }
            >
              {provenance}
            </span>
          </div>
        </figure>
      </Reveal>
    </Section>
  )
}

function provenanceLine(status: TelemetryStatus): string {
  if (status === 'offline') return 'telemetry unavailable'
  if (status === 'development') return `development data · adapter: ${telemetry.sourceName}`
  if (status === 'delayed') return `delayed · adapter: ${telemetry.sourceName}`
  return `adapter: ${telemetry.sourceName}`
}

function seriesKindLabel(status: TelemetryStatus, hovering: boolean): string {
  if (hovering) return '· historical'
  if (status === 'live') return '· latest'
  if (status === 'delayed') return '· delayed'
  if (status === 'offline') return ''
  return '· development'
}

function TelemetryStatusBadge({
  status,
  snap,
  now,
  pulse,
}: {
  status: TelemetryStatus
  snap: TelemetrySnapshot | null
  now: number
  pulse: boolean
}) {
  const copy = telemetryStatusCopy[status]
  const detail = telemetryStatusDetail(status, snap, now)
  return (
    <div
      role="status"
      className={`flex flex-col items-end gap-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${copy.toneClass}`}
      aria-label={detail ? `Telemetry ${copy.label}. ${detail}` : `Telemetry ${copy.label}`}
    >
      <span className="flex items-center gap-1.5">
        <span className={status === 'live' && pulse ? 'inline-block animate-pulse' : undefined} aria-hidden>
          {copy.glyph}
        </span>
        {copy.label}
      </span>
      {detail && (
        <span className="normal-case tracking-normal text-muted-foreground">{detail}</span>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-3 py-2.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-sm tabular-nums text-foreground">{value}</dd>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* time-series chart with grid, axis ticks, and hover crosshair        */
/* ------------------------------------------------------------------ */

function MetricChart({
  metric,
  range,
  color,
  unit,
  decimals,
  animate,
  activeIndex,
  onHover,
  status,
}: {
  metric: MetricSnapshot
  range: TimeRangeId
  color: string
  unit: string
  decimals: number
  animate: boolean
  activeIndex: number
  onHover: (i: number | null) => void
  status: TelemetryStatus
}) {
  const w = 760
  const h = 220
  const padX = 8
  const padY = 18
  const pts = metric.points
  const n = pts.length
  const vals = pts.map((p) => p.v)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range01 = max - min || 1
  const step = (w - padX * 2) / (n - 1)

  const xy = pts.map((p, i) => {
    const x = padX + i * step
    const y = padY + (h - padY * 2) * (1 - (p.v - min) / range01)
    return [x, y] as const
  })
  const line = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ')
  const area = `${line} L${xy[n - 1][0].toFixed(2)} ${h - padY} L${xy[0][0].toFixed(2)} ${h - padY} Z`

  const rows = 4
  const gridY = Array.from({ length: rows + 1 }, (_, i) => padY + ((h - padY * 2) / rows) * i)
  const gridLabels = Array.from({ length: rows + 1 }, (_, i) => max - (range01 / rows) * i)

  const active = xy[activeIndex]
  const activePoint = pts[activeIndex]

  // x-axis ticks (5 evenly spaced)
  const tickIdx = [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4), n - 1]

  const gid = `tele-${metric.id}`

  return (
    <div className="select-none">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full touch-none"
        preserveAspectRatio="none"
        role="img"
        aria-label={
          status === 'development'
            ? `${metric.id}: development data over the ${range} window. Not a live measurement.`
            : `${metric.id}: ${range} window. Status: ${status}.`
        }
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.24" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal grid + y labels */}
        {gridY.map((y, i) => (
          <g key={i}>
            <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="var(--grid-line)" strokeWidth="1" />
            <text
              x={w - padX}
              y={y - 3}
              textAnchor="end"
              className="fill-muted-foreground font-mono"
              style={{ fontSize: 9 }}
            >
              {gridLabels[i].toFixed(decimals)}
              {unit}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gid})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={animate ? 1 : undefined}
          style={
            animate
              ? {
                  strokeDasharray: 1,
                  strokeDashoffset: 1,
                  animation: 'draw 1.5s cubic-bezier(0.22,1,0.36,1) forwards',
                }
              : undefined
          }
        />

        {/* crosshair + marker */}
        {active && (
          <g>
            <line
              x1={active[0]}
              y1={padY}
              x2={active[0]}
              y2={h - padY}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.5"
            />
            <circle cx={active[0]} cy={active[1]} r="3.4" fill={color} />
            <circle cx={active[0]} cy={active[1]} r="6" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
          </g>
        )}

        {/* pointer capture overlay */}
        <rect
          x={padX}
          y={padY}
          width={w - padX * 2}
          height={h - padY * 2}
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            const frac = (e.clientX - r.left) / r.width
            const idx = Math.round(frac * (n - 1))
            onHover(Math.min(n - 1, Math.max(0, idx)))
          }}
          onPointerLeave={() => onHover(null)}
        />
      </svg>

      {/* x-axis time ticks */}
      <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
        {tickIdx.map((idx, i) => (
          <span key={i}>{activePoint ? formatAxis(pts[idx].t, range) : ''}</span>
        ))}
      </div>
    </div>
  )
}
