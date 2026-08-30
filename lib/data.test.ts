import { describe, expect, it } from 'vitest'
import { experience, homelabEdges, homelabNodes, projects, stack } from './data'

describe('content contracts', () => {
  it('gives every project a unique id', () => {
    const ids = projects.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('features exactly one case file', () => {
    expect(projects.filter((p) => p.feature).map((p) => p.id)).toEqual(['PRJ-01'])
  })

  it('keeps Pass the Mask playable and linked to source', () => {
    const mask = projects.find((p) => p.id === 'PRJ-05')
    expect(mask?.href).toBe('https://github.com/sivertun/mask-ggj')
    expect(mask?.playHref).toBe('https://emilorv.itch.io/pass-the-mask')
  })

  it('only uses playHref on projects that also have a source href', () => {
    for (const p of projects) {
      if (p.playHref) expect(p.href).toBeTruthy()
    }
  })

  it('connects homelab edges only between declared nodes', () => {
    const ids = new Set(homelabNodes.map((n) => n.id))
    for (const edge of homelabEdges) {
      expect(ids.has(edge.from)).toBe(true)
      expect(ids.has(edge.to)).toBe(true)
    }
  })

  it('keeps stack domains unique', () => {
    const domains = stack.map((s) => s.domain)
    expect(new Set(domains).size).toBe(domains.length)
  })

  it('keeps changelog rows uniquely keyed', () => {
    const keys = experience.map((e) => `${e.org}|${e.ts}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
