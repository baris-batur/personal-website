// ---------------------------------------------------------------------------
// Client-safe telemetry types and helpers.
// The sample generator and any upstream scrape live in server-only modules.
// The browser talks only to GET /api/telemetry (same origin).
// ---------------------------------------------------------------------------

export type MetricId = 'cpu' | 'memory' | 'disk' | 'network' | 'latency' | 'load'

export type TimeRangeId = '1h' | '6h' | '24h' | '7d'

export const TIME_RANGE_IDS: readonly TimeRangeId[] = ['1h', '6h', '24h', '7d']

export function isTimeRangeId(v: unknown): v is TimeRangeId {
  return v === '1h' || v === '6h' || v === '24h' || v === '7d'
}

export type TelemetryMode = 'development' | 'live'
export type TelemetryFreshness = 'ok' | 'stale' | 'unavailable'
export type TelemetryStatus = 'live' | 'delayed' | 'offline' | 'development'

export const TELEMETRY_STALE_MS = 3 * 60 * 1000

export interface MetricDefinition {
  id: MetricId
  label: string
  short: string
  unit: string
  color: string
  decimals: number
  description: string
}

export interface MetricPoint {
  t: number
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

/** Public host label only. Never a real machine name, OS, or region. */
export interface HostInfo {
  hostname: string
  os: string
  region: string
  uptimeSeconds: number
}

export interface TelemetrySnapshot {
  host: HostInfo
  mode: TelemetryMode
  freshness: TelemetryFreshness
  generatedAt: number
  scrapedAt?: number
  staleAfter?: number
  range: TimeRangeId
  metrics: Record<MetricId, MetricSnapshot>
  /** Public adapter label. Never an internal hostname or Prom job. */
  adapter: string
}

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

export const PUBLIC_HOST: HostInfo = {
  hostname: 'lab',
  os: '',
  region: '',
  uptimeSeconds: 0,
}

export const PUBLIC_ADAPTER = 'sanitizer'

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

export function formatLastUpdate(ts: number, now: number): string {
  const s = Math.max(0, Math.floor((now - ts) / 1000))
  if (s < 60) return `last update ${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `last update ${m}m ago`
  const h = Math.floor(m / 60)
  return `last update ${h}h ago`
}

export const telemetryStatusCopy: Record<
  TelemetryStatus,
  { glyph: string; label: string; toneClass: string }
> = {
  live: { glyph: '●', label: 'LIVE', toneClass: 'text-signal-green' },
  delayed: { glyph: '◐', label: 'DELAYED', toneClass: 'text-signal-amber' },
  offline: { glyph: '○', label: 'OFFLINE', toneClass: 'text-muted-foreground' },
  development: { glyph: '◇', label: 'DEVELOPMENT DATA', toneClass: 'text-signal-amber' },
}

export function resolveTelemetryStatus(args: {
  sourceMode: TelemetryMode
  snap: TelemetrySnapshot | null
  fetchFailed: boolean
  now?: number
}): TelemetryStatus {
  if (args.sourceMode === 'development') return 'development'

  const snap = args.snap
  if (!snap || snap.mode !== 'live') return 'offline'

  const now = args.now ?? Date.now()
  const staleAfter = snap.staleAfter ?? snap.generatedAt + TELEMETRY_STALE_MS
  const expired = now > staleAfter

  if (snap.freshness === 'unavailable') return 'offline'
  if (args.fetchFailed && expired) return 'offline'
  if (args.fetchFailed || snap.freshness === 'stale' || expired) return 'delayed'
  return 'live'
}

export function telemetryStatusDetail(
  status: TelemetryStatus,
  snap: TelemetrySnapshot | null,
  now: number,
): string | null {
  if (status === 'offline') return 'telemetry unavailable'
  if (status === 'development') return null
  if (!snap) return null
  if (status === 'delayed') {
    return formatLastUpdate(snap.scrapedAt ?? snap.generatedAt, now)
  }
  return `updated ${formatClock(snap.generatedAt)}`
}

export async function fetchPublicSnapshot(range: TimeRangeId): Promise<TelemetrySnapshot> {
  if (!isTimeRangeId(range)) throw new Error('unavailable')
  const res = await fetch(`/api/telemetry?range=${range}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('unavailable')
  const body: unknown = await res.json()
  const snap = asTelemetrySnapshot(body)
  if (!snap) throw new Error('unavailable')
  return snap
}

function asTelemetrySnapshot(body: unknown): TelemetrySnapshot | null {
  if (!body || typeof body !== 'object') return null
  const o = body as Record<string, unknown>
  if (o.mode !== 'development' && o.mode !== 'live') return null
  if (o.freshness !== 'ok' && o.freshness !== 'stale' && o.freshness !== 'unavailable') return null
  if (!isTimeRangeId(o.range)) return null
  if (typeof o.generatedAt !== 'number' || !Number.isFinite(o.generatedAt)) return null
  if (!o.metrics || typeof o.metrics !== 'object') return null
  const host = o.host
  if (!host || typeof host !== 'object') return null
  const h = host as Record<string, unknown>
  if (typeof h.hostname !== 'string' || typeof h.uptimeSeconds !== 'number') return null
  return {
    host: {
      hostname: h.hostname,
      os: typeof h.os === 'string' ? h.os : '',
      region: typeof h.region === 'string' ? h.region : '',
      uptimeSeconds: h.uptimeSeconds,
    },
    mode: o.mode,
    freshness: o.freshness,
    generatedAt: o.generatedAt,
    scrapedAt: typeof o.scrapedAt === 'number' ? o.scrapedAt : undefined,
    staleAfter: typeof o.staleAfter === 'number' ? o.staleAfter : undefined,
    range: o.range,
    metrics: o.metrics as TelemetrySnapshot['metrics'],
    adapter: typeof o.adapter === 'string' && o.adapter.length < 32 ? o.adapter : PUBLIC_ADAPTER,
  }
}
