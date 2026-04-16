import { useCallback, useEffect, useRef, useState } from 'react'


interface UseApiState<T> {
  data:     T | null
  loading:  boolean
  error:    string | null
  refetch:  () => void
}


interface UseApiOptions {
  /** Auto-refetch interval in milliseconds. Omit or 0 to disable. */
  intervalMs?: number
  /** Pause the auto-refetch loop when the tab isn't visible. Defaults to true. */
  pauseWhenHidden?: boolean
}


/**
 * Generic fetch hook. Runs on mount and whenever `deps` change.
 *
 * Pass `intervalMs` to enable auto-refresh. The loop pauses while the
 * tab is hidden (browsers throttle but don't fully stop setInterval; the
 * visibility check kills it entirely and re-runs once on re-show so the
 * UI reflects current state the moment the user comes back).
 *
 * In-flight requests during unmount/tab-hide are swallowed rather than
 * set into state, preventing the classic "setState on unmounted" warning.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps:    unknown[] = [],
  options: UseApiOptions = {},
): UseApiState<T> {
  const { intervalMs = 0, pauseWhenHidden = true } = options

  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const stopped = useRef(false)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      if (stopped.current) return
      setData(result)
    } catch (err) {
      if (stopped.current) return
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      if (!stopped.current) setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  // Mount + deps-changed fetch.
  useEffect(() => {
    stopped.current = false
    execute()

    return () => { stopped.current = true }
  }, [execute])

  // Auto-refresh loop, if enabled.
  useEffect(() => {
    if (!intervalMs) return

    let id: ReturnType<typeof setInterval> | null = null

    function start() {
      if (id) return
      id = setInterval(execute, intervalMs)
    }

    function stop() {
      if (!id) return
      clearInterval(id)
      id = null
    }

    function handleVisibility() {
      if (!pauseWhenHidden) return
      if (document.visibilityState === 'hidden') {
        stop()
      } else {
        execute()    // catch up immediately on re-show
        start()
      }
    }

    if (pauseWhenHidden && document.visibilityState === 'hidden') {
      // Tab starts hidden — wait for it to become visible.
    } else {
      start()
    }

    if (pauseWhenHidden) {
      document.addEventListener('visibilitychange', handleVisibility)
    }

    return () => {
      stop()
      if (pauseWhenHidden) {
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    }
  }, [intervalMs, pauseWhenHidden, execute])

  return { data, loading, error, refetch: execute }
}
