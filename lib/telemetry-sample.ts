import 'server-only'

import {
  metricDefs,
  timeRanges,
  PUBLIC_ADAPTER,
  PUBLIC_HOST,
  type MetricId,
  type MetricPoint,
  type MetricSnapshot,
  type TelemetrySnapshot,
  type TimeRangeId,
} from './telemetry'

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
    v += (shape.base - v) * 0.06
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

/** Sample series only. Never labelled live. Host fields are the public alias. */
export function buildDevelopmentSnapshot(range: TimeRangeId, now = Date.now()): TelemetrySnapshot {
  const metrics = {} as Record<MetricId, MetricSnapshot>
  for (const def of metricDefs) metrics[def.id] = buildMetric(def.id, range, now)

  return {
    host: {
      ...PUBLIC_HOST,
      uptimeSeconds: 6 * 86400 + 4 * 3600 + 37 * 60,
    },
    mode: 'development',
    freshness: 'ok',
    generatedAt: now,
    range,
    metrics,
    adapter: PUBLIC_ADAPTER,
  }
}
