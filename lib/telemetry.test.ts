import { describe, expect, it } from 'vitest'
import {
  TELEMETRY_STALE_MS,
  formatUptime,
  resolveTelemetryStatus,
  type TelemetrySnapshot,
} from './telemetry'

function liveSnap(overrides: Partial<TelemetrySnapshot> = {}): TelemetrySnapshot {
  const generatedAt = 1_700_000_000_000
  return {
    host: { hostname: 'lab', os: 'linux', region: 'home', uptimeSeconds: 60 },
    mode: 'live',
    freshness: 'ok',
    generatedAt,
    scrapedAt: generatedAt,
    staleAfter: generatedAt + TELEMETRY_STALE_MS,
    range: '1h',
    metrics: {} as TelemetrySnapshot['metrics'],
    ...overrides,
  }
}

describe('resolveTelemetryStatus', () => {
  it('labels a development source as development even when a snapshot exists', () => {
    expect(
      resolveTelemetryStatus({
        sourceMode: 'development',
        snap: liveSnap({ mode: 'development' }),
        fetchFailed: false,
      }),
    ).toBe('development')
  })

  it('never maps a live source to development on fetch failure', () => {
    expect(
      resolveTelemetryStatus({
        sourceMode: 'live',
        snap: liveSnap(),
        fetchFailed: true,
        now: liveSnap().generatedAt + 1_000,
      }),
    ).toBe('delayed')
  })

  it('goes offline when a live source has no snapshot', () => {
    expect(
      resolveTelemetryStatus({
        sourceMode: 'live',
        snap: null,
        fetchFailed: true,
      }),
    ).toBe('offline')
  })

  it('goes offline after the stale window on a failed live scrape', () => {
    const snap = liveSnap()
    expect(
      resolveTelemetryStatus({
        sourceMode: 'live',
        snap,
        fetchFailed: true,
        now: snap.generatedAt + TELEMETRY_STALE_MS + 1,
      }),
    ).toBe('offline')
  })

  it('stays live for a fresh live snapshot', () => {
    const snap = liveSnap()
    expect(
      resolveTelemetryStatus({
        sourceMode: 'live',
        snap,
        fetchFailed: false,
        now: snap.generatedAt + 1_000,
      }),
    ).toBe('live')
  })
})

describe('formatUptime', () => {
  it('formats days, hours, and minutes', () => {
    expect(formatUptime(6 * 86400 + 4 * 3600 + 37 * 60)).toBe('6d 04h 37m')
  })
})
