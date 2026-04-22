import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronRight }         from 'lucide-react'

import { useApi }               from '../../hooks/useApi'
import { getProjectLogs }       from '../../api/logs'
import RefreshButton            from '../global/RefreshButton'
import type { ProjectInfo }     from '../../types/project'
import type { LogStream }       from '../../types/log'


interface ServiceLogsProps {
  project: ProjectInfo
}


const POLL_INTERVAL_MS = 5_000
const TAIL_LINES       = 200


/**
 * Inline logs viewer — lives in the DetailPane below Recent deploys.
 *
 * Handles projects with multiple components (api, frontend) by showing
 * a segmented toggle. Stream toggle is always visible (stdout/stderr).
 * Auto-refreshes every 5s via useApi; pauses when tab is hidden.
 *
 * Renders nothing if the project has no `logs` entry in its registry.
 * This makes it a zero-cost passive component to drop into DetailPane.
 */
export default function ServiceLogs({ project }: ServiceLogsProps) {

  // ── Early-out for projects without logs configured ──────────────────
  const components = useMemo(
    () => project.logs ? Object.keys(project.logs) : [],
    [project.logs],
  )

  const [component, setComponent] = useState<string>(components[0] ?? '')
  const [stream, setStream]       = useState<LogStream>('stdout')
  const [open, setOpen]           = useState<boolean>(false)

  // Reset component when the project changes (e.g. user picks a different row).
  useEffect(() => {
    setComponent(components[0] ?? '')
    setStream('stdout')
  }, [project.key, components])

  const streamsAvailable = useMemo(() => {
    if (!project.logs || !component) return { stdout: false, stderr: false }
    const entry = project.logs[component] ?? {}

    return {
      stdout: Boolean(entry.stdout),
      stderr: Boolean(entry.stderr),
    }
  }, [project.logs, component])

  // If the selected stream isn't available for this component, flip to
  // whichever one IS available so we never leave the user on a dead toggle.
  useEffect(() => {
    if (stream === 'stdout' && !streamsAvailable.stdout && streamsAvailable.stderr) {
      setStream('stderr')
    }
    if (stream === 'stderr' && !streamsAvailable.stderr && streamsAvailable.stdout) {
      setStream('stdout')
    }
  }, [stream, streamsAvailable])

  // Only fetch when the section is actually visible — no point hammering
  // the API for logs the user isn't looking at.
  const canFetch = Boolean(open && project.logs && component && streamsAvailable[stream])

  const { data, loading, error, refetch } = useApi(
    () => canFetch
      ? getProjectLogs(project.key, component, stream, TAIL_LINES)
      : Promise.resolve(null),
    [project.key, component, stream, canFetch],
    { intervalMs: canFetch ? POLL_INTERVAL_MS : 0 },
  )

  const viewportRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to bottom when new lines arrive (only while open — the
  // viewport isn't rendered visible while collapsed).
  useEffect(() => {
    if (!open) return
    const el = viewportRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [data?.lines, open])

  function handleHeaderKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(v => !v)
    }
  }

  if (!project.logs || components.length === 0) {
    return null
  }

  const lines      = data?.lines    ?? []
  const isMissing  = data?.missing  ?? false
  const loggedPath = data?.path

  return (
    <section className="detail-section">
      <div
        className={`detail-section-header collapsible-header ${open ? 'is-open' : ''}`}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        onKeyDown={handleHeaderKey}
      >
        <span className="collapsible-title">
          <ChevronRight size={14} className="collapsible-chevron" />
          <h2>Logs</h2>
        </span>
        <div className="collapsible-header-right" onClick={e => e.stopPropagation()}>
          <span className="count">
            {open && data ? `${lines.length} lines` : '—'}
          </span>
          {open && <RefreshButton onClick={refetch} spinning={loading} />}
        </div>
      </div>

      <div className={`collapsible ${open ? 'is-open' : ''}`}>
        <div className="collapsible-inner">

          {/* ── Toggles ─────────────────────────────────────────────────── */}
          <div className="logs-toggles">
            {components.length > 1 && (
              <div className="logs-toggle-row">
                <span className="logs-toggle-label">Component</span>
                <div className="logs-segmented">
                  {components.map(c => (
                    <button
                      key={c}
                      className={`logs-segment ${c === component ? 'is-active' : ''}`}
                      onClick={() => setComponent(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="logs-toggle-row">
              <span className="logs-toggle-label">Stream</span>
              <div className="logs-segmented">
                <button
                  className={`logs-segment ${stream === 'stdout' ? 'is-active' : ''}`}
                  onClick={() => setStream('stdout')}
                  disabled={!streamsAvailable.stdout}
                >
                  stdout
                </button>
                <button
                  className={`logs-segment ${stream === 'stderr' ? 'is-active' : ''}`}
                  onClick={() => setStream('stderr')}
                  disabled={!streamsAvailable.stderr}
                >
                  stderr
                </button>
              </div>
            </div>
          </div>

          {/* ── Viewport ────────────────────────────────────────────────── */}
          <div className="logs-viewport" ref={viewportRef}>
            {error && !data && (
              <div className="logs-missing">Error loading logs: {error}</div>
            )}

            {!error && isMissing && (
              <div className="logs-missing">
                Log file not present on disk yet. Path: {loggedPath}
              </div>
            )}

            {!error && !isMissing && lines.length === 0 && (
              <div className="logs-empty">
                {loading ? 'Loading...' : 'Log file is empty.'}
              </div>
            )}

            {!error && !isMissing && lines.length > 0 && lines.map((line, i) => (
              <div key={i} className="logs-row">
                <span className="logs-row-number">{i + 1}</span>
                <span className="logs-row-content">{line}</span>
              </div>
            ))}
          </div>

          {loggedPath && (
            <div className="logs-footer-path">{loggedPath}</div>
          )}
        </div>
      </div>
    </section>
  )
}
