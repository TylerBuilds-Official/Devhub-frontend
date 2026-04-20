/**
 * Tiny pub/sub so non-React code (the API client) can signal the auth
 * tree that the session died — e.g. backend returned 401 on a request
 * that already carried a freshly-acquired token. The token MSAL has
 * cached is out of sync with what the backend will accept, and the
 * only sensible recovery is a full re-auth.
 *
 * AuthGate subscribes at mount; the API client fires from the retry
 * path in client.ts. No external deps, no React context needed.
 */
type Listener = () => void

const listeners = new Set<Listener>()


export function emitSessionExpired(): void {
  for (const fn of listeners) {
    try { fn() } catch { /* a subscriber throwing shouldn't break the others */ }
  }
}


export function onSessionExpired(fn: Listener): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
