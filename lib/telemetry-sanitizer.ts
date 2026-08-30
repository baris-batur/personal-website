import 'server-only'

import { buildDevelopmentSnapshot } from './telemetry-sample'
import { isTimeRangeId, type TelemetrySnapshot, type TimeRangeId } from './telemetry'

const CACHE_MS = 15_000
const cache = new Map<TimeRangeId, { at: number; snap: TelemetrySnapshot }>()

/**
 * Public telemetry only. This module never:
 * - accepts PromQL, URLs, or extra query keys from the caller
 * - forwards the request to Prometheus / Grafana / node_exporter
 * - puts internal hostnames in the payload
 *
 * Live upstream is not wired. TELEMETRY_MODE=live returns unavailable
 * rather than sample data labelled as live, and rather than proxying.
 */
export async function getPublicSnapshot(range: unknown): Promise<
  | { ok: true; snap: TelemetrySnapshot }
  | { ok: false; status: 400 | 503 }
> {
  if (!isTimeRangeId(range)) return { ok: false, status: 400 }

  const mode = process.env.TELEMETRY_MODE === 'live' ? 'live' : 'development'

  if (mode === 'live') {
    return { ok: false, status: 503 }
  }

  const now = Date.now()
  const hit = cache.get(range)
  if (hit && now - hit.at < CACHE_MS) return { ok: true, snap: hit.snap }

  const snap = buildDevelopmentSnapshot(range, now)
  cache.set(range, { at: now, snap })
  return { ok: true, snap }
}
