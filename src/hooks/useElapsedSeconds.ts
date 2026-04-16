import { useEffect, useState } from 'react'


/**
 * Returns elapsed seconds since `startAt`, ticking every second.
 * Pass `null` to pause (freezes at its last value).
 */
export function useElapsedSeconds(startAt: number | null): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (startAt == null) return

    const id = setInterval(() => setNow(Date.now()), 1000)

    return () => clearInterval(id)
  }, [startAt])

  if (startAt == null) return 0

  return Math.max(0, Math.floor((now - startAt) / 1000))
}


/**
 * Format elapsed seconds as `m:ss` or `h:mm:ss`.
 */
export function formatElapsed(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return `${m}:${String(s).padStart(2, '0')}`
}
