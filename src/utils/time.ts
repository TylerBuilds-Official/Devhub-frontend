/**
 * Render an ISO timestamp as a short relative string.
 * "just now" · "42s ago" · "3m ago" · "2h ago" · "yesterday" · "May 14"
 */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—'

  const then = new Date(iso).getTime()
  const now  = Date.now()
  const secs = Math.max(0, Math.floor((now - then) / 1000))

  if (secs < 5)      return 'just now'
  if (secs < 60)     return `${secs}s ago`

  const mins = Math.floor(secs / 60)
  if (mins < 60)     return `${mins}m ago`

  const hours = Math.floor(mins / 60)
  if (hours < 24)    return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1)    return 'yesterday'
  if (days < 7)      return `${days}d ago`

  const d = new Date(iso)

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}


/**
 * Render an ISO timestamp as an absolute short form. "May 14, 2:04 PM"
 */
export function absoluteTime(iso: string | null | undefined): string {
  if (!iso) return '—'

  return new Date(iso).toLocaleString('en-US', {
    month:  'short',
    day:    'numeric',
    hour:   'numeric',
    minute: '2-digit',
  })
}
