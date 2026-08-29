'use client'

import { useId } from 'react'

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function points(series: number[], w: number, h: number, pad = 2) {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min || 1
  const step = (w - pad * 2) / (series.length - 1)
  return series.map((v, i) => {
    const x = pad + i * step
    const y = pad + (h - pad * 2) * (1 - (v - min) / range)
    return [x, y] as const
  })
}

function toPath(pts: readonly (readonly [number, number])[]) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ')
}

/* ------------------------------------------------------------------ */
/* Sparkline                                                          */
/* ------------------------------------------------------------------ */

export function Sparkline({
  series,
  color = 'var(--signal-amber)',
  width = 120,
  height = 34,
  fill = true,
}: {
  series: number[]
  color?: string
  width?: number
  height?: number
  fill?: boolean
}) {
  const id = useId()
  const pts = points(series, width, height, 2)
  const line = toPath(pts)
  const area = `${line} L${pts[pts.length - 1][0].toFixed(2)} ${height} L${pts[0][0].toFixed(2)} ${height} Z`
  const last = pts[pts.length - 1]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#spark-${id})`} />
        </>
      )}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.2" fill={color} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Area chart with grid + ticks (latency)                             */
/* ------------------------------------------------------------------ */

export function AreaChart({
  series,
  color = 'var(--signal-cyan)',
  height = 200,
  unit = 'ms',
  animate = false,
}: {
  series: number[]
  color?: string
  height?: number
  unit?: string
  animate?: boolean
}) {
  const id = useId()
  const w = 760
  const h = height
  const padX = 8
  const padY = 16
  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min || 1
  const step = (w - padX * 2) / (series.length - 1)

  const pts = series.map((v, i) => {
    const x = padX + i * step
    const y = padY + (h - padY * 2) * (1 - (v - min) / range)
    return [x, y] as const
  })
  const line = toPath(pts)
  const area = `${line} L${pts[pts.length - 1][0].toFixed(2)} ${h - padY} L${pts[0][0].toFixed(2)} ${h - padY} Z`

  const rows = 4
  const gridLines = Array.from({ length: rows + 1 }, (_, i) => padY + ((h - padY * 2) / rows) * i)
  const labels = Array.from({ length: rows + 1 }, (_, i) => Math.round(max - (range / rows) * i))

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Illustrative sample time series"
    >
      <defs>
        <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines.map((y, i) => (
        <g key={i}>
          <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="var(--grid-line)" strokeWidth="1" />
          <text
            x={w - padX}
            y={y - 3}
            textAnchor="end"
            className="fill-muted-foreground font-mono"
            style={{ fontSize: 9 }}
          >
            {labels[i]}
            {unit}
          </text>
        </g>
      ))}
      <path d={area} fill={`url(#area-${id})`} />
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
                animation: 'draw 1.6s cubic-bezier(0.22,1,0.36,1) forwards',
              }
            : undefined
        }
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Bar histogram (traffic)                                            */
/* ------------------------------------------------------------------ */

export function BarHistogram({
  series,
  color = 'var(--signal-amber)',
  height = 120,
}: {
  series: number[]
  color?: string
  height?: number
}) {
  const max = Math.max(...series) || 1
  const gap = 3

  return (
    <div
      className="flex w-full items-end"
      style={{ height, gap }}
      role="img"
      aria-label="Illustrative sample distribution"
    >
      {series.map((v, i) => {
        const isPeak = v === max
        return (
          <div
            key={i}
            className="group relative flex-1 rounded-[1px] transition-[height,opacity] duration-500"
            style={{
              height: `${Math.max(3, (v / max) * 100)}%`,
              background: isPeak ? color : 'color-mix(in oklch, var(--foreground) 22%, transparent)',
              opacity: isPeak ? 1 : 0.85,
            }}
          >
            <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded bg-popover px-1 py-0.5 font-mono text-[9px] text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100">
              {v}k
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* SLO budget arc                                                     */
/* ------------------------------------------------------------------ */

export function SloArc({
  value,
  size = 74,
  color = 'var(--signal-green)',
}: {
  value: number // 0-100 budget remaining
  size?: number
  color?: string
}) {
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const arc = 0.75 // draw 270deg
  const dash = c * arc
  const filled = dash * (value / 100)
  const tone = value > 50 ? color : value > 20 ? 'var(--signal-amber)' : 'var(--signal-red)'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <g transform={`rotate(135 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--grid-line)"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${c}`}
          strokeLinecap="round"
        />
      </g>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground font-mono font-numeric"
        style={{ fontSize: 15, fontWeight: 600 }}
      >
        {value}
      </text>
    </svg>
  )
}
