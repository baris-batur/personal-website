// ---------------------------------------------------------------------------
// Telemetry adapter
// ---------------------------------------------------------------------------
// A typed interface over a personal server's metrics. The UI talks ONLY to the
// `TelemetrySource` contract below, so a real exporter (node_exporter /
// Prometheus / a small /api/metrics route) can be dropped in later WITHOUT
// touching the component — just implement `TelemetrySource` and swap the
// exported `telemetry` singleton.
//
// Nothing here is presented as live. The bundled source is a deterministic
// SAMPLE generator (mode: 'sample'); the UI labels every value accordingly and
// never implies a real measurement.
// ---------------------------------------------------------------------------

export type MetricId = 'cpu' | 'memory' | 'disk' | 'network' | 'latency' | 'load'

export type TimeRangeId = '1h' | '6h' | '24h' | '7d'

export type TelemetryMode = 'sample' | 'live'

export interface MetricDefinition {
  id: MetricId
  label: string
  short: string
  unit: string
  /** css custom property, kept within the site's signal palette */
  color: string
  decimals: number
  description: string
}

export interface MetricPoint {
  t: number // epoch ms
  v: number
}

export interface MetricSnapshot {
  id: MetricId
  points: MetricPoint[]
  current: number
  min: number
  max: number
  avg: number
}

export interface HostInfo {
  hostname: string
  os: string
  region: string
  uptimeSeconds: number
}

export interface TelemetrySnapshot {
  host: HostInfo
  mode: TelemetryMode
  /** when this snapshot was produced (client clock, on fetch) */
  generatedAt: number
  range: TimeRangeId
  metrics: Record<MetricId, MetricSnapshot>
}

/** Implement this against a real endpoint later; the UI depends only on this. */
export interface TelemetrySource {
  readonly mode: TelemetryMode
  readonly sourceName: string
  fetchSnapshot(range: TimeRangeId, now?: number): Promise<TelemetrySnapshot>
}

/* ------------------------------------------------------------------ */
/* metric catalogue                                                    */
/* ------------------------------------------------------------------ */

export const metricDefs: MetricDefinition[] = [
  {
    id: 'cpu',
    label: 'CPU usage',
    short: 'cpu',
    unit: '%',
    color: 'var(--signal-amber)',
    decimals: 1,
    description: 'Aggregate processor utilisation across all cores.',
  },
  {
    id: 'memory',
    label: 'Memory usage',
    short: 'mem',
    unit: '%',
    color: 'var(--signal-cyan)',
    decimals: 1,
    description: 'Resident memory in use versus total available RAM.',
  },
  {
    id: 'disk',
    label: 'Disk usage',
    short: 'disk',
    unit: '%',
    color: 'var(--signal-green)',
    decimals: 1,
    description: 'Space consumed on the primary storage volume.',
  },
  {
    id: 'network',
    label: 'Network throughput',
    short: 'net',
    unit: 'MB/s',
    color: 'var(--signal-cyan)',
    decimals: 2,
    description: 'Combined inbound and outbound transfer rate.',
  },
  {
    id: 'latency',
    label: 'Request latency',
    short: 'p95',
    unit: 'ms',
    color: 'var(--signal-amber)',
    decimals: 0,
    description: 'Round-trip response time for the reverse proxy.',
  },
  {
    id: 'load',
    label: 'System load',
    short: 'load',
    unit: '',
    color: 'var(--signal-green)',
    decimals: 2,
    description: 'Kernel 1-minute load average.',
  },
]

export const timeRanges: { id: TimeRangeId; label: string; points: number; stepSeconds: number }[] = [
  { id: '1h', label: '1H', points: 60, stepSeconds: 60 },
  { id: '6h', label: '6H', points: 72, stepSeconds: 300 },
  { id: '24h', label: '24H', points: 96, stepSeconds: 900 },
  { id: '7d', label: '7D', points: 84, stepSeconds: 7200 },
]

/* ------------------------------------------------------------------ */
/* deterministic sample generator                                      */
/* ------------------------------------------------------------------ */

type Shape = { base: number; min: number; max: number; volatility: number; spike: number }

const shapes: Record<MetricId, Shape> = {
  cpu: { base: 14, min: 3, max: 82, volatility: 4, spike: 0.06 },
  memory: { base: 47, min: 38, max: 74, volatility: 1.6, spike: 0.03 },
  disk: { base: 63, min: 61, max: 68, volatility: 0.35, spike: 0.01 },
  network: { base: 2.2, min: 0.1, max: 46, volatility: 2.6, spike: 0.08 },
  latency: { base: 26, min: 12, max: 140, volatility: 6, spike: 0.05 },
  load: { base: 0.35, min: 0.05, max: 2.8, volatility: 0.12, spike: 0.05 },
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function round(v: number, decimals: number) {
  const f = 10 ** decimals
  return Math.round(v * f) / f
}

function buildMetric(id: MetricId, range: TimeRangeId, now: number): MetricSnapshot {
  const shape = shapes[id]
  const def = metricDefs.find((d) => d.id === id)!
  const cfg = timeRanges.find((r) => r.id === range)!
  const rand = mulberry32(hashSeed(`${id}:${range}`))

  const raw: number[] = []
  let v = shape.base
  for (let i = 0; i < cfg.points; i++) {
    v += (rand() * 2 - 1) * shape.volatility
    v += (shape.base - v) * 0.06 // gentle mean reversion
    if (rand() < shape.spike) v += (shape.max - shape.base) * (0.4 + rand() * 0.5)
    v = Math.min(shape.max, Math.max(shape.min, v))
    raw.push(v)
  }

  const points: MetricPoint[] = raw.map((val, i) => ({
    t: now - (cfg.points - 1 - i) * cfg.stepSeconds * 1000,
    v: round(val, def.decimals),
  }))

  const vals = points.map((p) => p.v)
  const sum = vals.reduce((a, b) => a + b, 0)
  return {
    id,
    points,
    current: vals[vals.length - 1],
    min: round(Math.min(...vals), def.decimals),
    max: round(Math.max(...vals), def.decimals),
    avg: round(sum / vals.length, def.decimals),
  }
}

class SampleTelemetrySource implements TelemetrySource {
  readonly mode = 'sample' as const
  readonly sourceName = 'sample-generator'

  async fetchSnapshot(range: TimeRangeId, now: number = Date.now()): Promise<TelemetrySnapshot> {
    const metrics = {} as Record<MetricId, MetricSnapshot>
    for (const def of metricDefs) metrics[def.id] = buildMetric(def.id, range, now)

    return {
      host: {
        hostname: 'nyx',
        os: 'Debian 12 (bookworm)',
        region: 'Trondheim, NO',
        // sample value — clearly labelled in the UI, not a real uptime claim
        uptimeSeconds: 6 * 86400 + 4 * 3600 + 37 * 60,
      },
      mode: this.mode,
      generatedAt: now,
      range,
      metrics,
    }
  }
}

/**
 * The single source the UI consumes. Replace this line with a live
 * implementation (e.g. `new PrometheusSource('/api/metrics')`) once a real
 * exporter is wired up — no component changes required.
 */
export const telemetry: TelemetrySource = new SampleTelemetrySource()

/* ------------------------------------------------------------------ */
/* formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export function formatMetric(def: MetricDefinition, v: number): string {
  const n = v.toFixed(def.decimals)
  return def.unit ? `${n}${def.unit === '%' ? '' : ' '}${def.unit}` : n
}

export function formatClock(ts: number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

export function formatAxis(ts: number, range: TimeRangeId): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  if (range === '7d') return `${p(d.getDate())}/${p(d.getMonth() + 1)}`
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d}d ${p(h)}h ${p(m)}m`
}
