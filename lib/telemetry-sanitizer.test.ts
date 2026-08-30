import { afterEach, describe, expect, it } from 'vitest'
import { GET } from '@/app/api/telemetry/route'
import { getPublicSnapshot } from './telemetry-sanitizer'
import { isTimeRangeId } from './telemetry'

function request(path: string, ip: string) {
  return new Request(`http://localhost${path}`, {
    headers: { 'x-forwarded-for': ip },
  })
}

describe('isTimeRangeId', () => {
  it('allowlists the public windows only', () => {
    expect(isTimeRangeId('1h')).toBe(true)
    expect(isTimeRangeId('6h')).toBe(true)
    expect(isTimeRangeId('24h')).toBe(true)
    expect(isTimeRangeId('7d')).toBe(true)
    expect(isTimeRangeId('30d')).toBe(false)
    expect(isTimeRangeId('up')).toBe(false)
  })
})

describe('getPublicSnapshot', () => {
  afterEach(() => {
    delete process.env.TELEMETRY_MODE
  })

  it('rejects unknown ranges', async () => {
    expect(await getPublicSnapshot('30d')).toEqual({ ok: false, status: 400 })
    expect(await getPublicSnapshot('up')).toEqual({ ok: false, status: 400 })
  })

  it('returns labelled development data with the public host alias', async () => {
    const result = await getPublicSnapshot('1h')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.snap.mode).toBe('development')
    expect(result.snap.host.hostname).toBe('lab')
    expect(result.snap.host.os).toBe('')
    expect(result.snap.host.region).toBe('')
    expect(result.snap.adapter).toBe('sanitizer')
    expect(JSON.stringify(result.snap)).not.toMatch(/nyx|Debian|Trondheim|prometheus|PromQL/i)
  })

  it('does not serve sample data labelled as live', async () => {
    process.env.TELEMETRY_MODE = 'live'
    expect(await getPublicSnapshot('1h')).toEqual({ ok: false, status: 503 })
  })
})

describe('GET /api/telemetry', () => {
  afterEach(() => {
    delete process.env.TELEMETRY_MODE
  })

  it('ignores extra query keys and still returns the allowlisted range', async () => {
    const res = await GET(request('/api/telemetry?range=1h&query=up&url=http://127.0.0.1:9090', '203.0.113.10'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.range).toBe('1h')
    expect(body.mode).toBe('development')
    expect(body.query).toBeUndefined()
    expect(JSON.stringify(body)).not.toMatch(/9090|promql|node_exporter/i)
  })

  it('rejects an unknown range', async () => {
    const res = await GET(request('/api/telemetry?range=30d', '203.0.113.11'))
    expect(res.status).toBe(400)
  })

  it('rate-limits a noisy client', async () => {
    const ip = '203.0.113.99'
    let last = 200
    for (let i = 0; i < 31; i++) {
      last = (await GET(request('/api/telemetry?range=1h', ip))).status
    }
    expect(last).toBe(429)
  })
})
