import { getPublicSnapshot } from '@/lib/telemetry-sanitizer'

export const dynamic = 'force-dynamic'

const WINDOW_MS = 60_000
const MAX_HITS = 30
const hits = new Map<string, number[]>()

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) {
    const first = fwd.split(',')[0]?.trim()
    if (first) return first.slice(0, 64)
  }
  return req.headers.get('x-real-ip')?.slice(0, 64) ?? 'unknown'
}

function allow(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent)
    return false
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 10_000) hits.clear()
  return true
}

function json(data: unknown, status: number, extra?: HeadersInit) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, max-age=15',
      ...extra,
    },
  })
}

export async function GET(req: Request) {
  if (!allow(clientIp(req))) {
    return json({ error: 'rate limited' }, 429, { 'retry-after': '60' })
  }

  try {
    const range = new URL(req.url).searchParams.get('range')
    const result = await getPublicSnapshot(range)

    if (!result.ok) {
      const message = result.status === 400 ? 'invalid range' : 'telemetry unavailable'
      return json({ error: message }, result.status)
    }

    return json(result.snap, 200)
  } catch {
    return json({ error: 'telemetry unavailable' }, 503)
  }
}
