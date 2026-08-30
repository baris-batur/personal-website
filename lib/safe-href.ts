export function isSafeExternalHref(href: string): boolean {
  try {
    const u = new URL(href)
    return u.protocol === 'https:' || u.protocol === 'mailto:'
  } catch {
    return false
  }
}
