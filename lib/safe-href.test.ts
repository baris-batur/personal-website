import { describe, expect, it } from 'vitest'
import { isSafeExternalHref } from './safe-href'

describe('isSafeExternalHref', () => {
  it('allows https and mailto', () => {
    expect(isSafeExternalHref('https://github.com/baris-batur')).toBe(true)
    expect(isSafeExternalHref('mailto:hello@example.com')).toBe(true)
  })

  it('rejects http, javascript, and relative values', () => {
    expect(isSafeExternalHref('http://example.com')).toBe(false)
    expect(isSafeExternalHref('javascript:alert(1)')).toBe(false)
    expect(isSafeExternalHref('/internal')).toBe(false)
    expect(isSafeExternalHref('')).toBe(false)
  })
})
