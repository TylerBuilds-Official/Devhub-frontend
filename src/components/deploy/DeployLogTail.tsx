import { useEffect, useMemo, useRef } from 'react'

import { segmentGitDiffMarkers, toLogDisplayRows } from '../../utils/logTone'


interface DeployLogTailProps {
  lines:      string[]
  emptyText?: string
  height?:    number | string    // override the default CSS height if needed
}


/**
 * Shared log-tail component. Auto-scrolls to the newest line when lines change.
 * Used by DeployRunningView, DeployDoneView, and JobDetailPage.
 */
export default function DeployLogTail({ lines, emptyText, height }: DeployLogTailProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const style = height !== undefined ? { height } : undefined
  const rows = useMemo(() => toLogDisplayRows(lines), [lines])

  return (
    <div className="deploy-log-tail" ref={ref} style={style} role="log" aria-live="polite">
      {lines.length === 0 ? (
        <span className="deploy-log-empty">
          {emptyText ?? 'No log output.'}
        </span>
      ) : (
        rows.map(row => {
          const emphasisClass = row.fastForward ? ' has-fast-forward' : ''

          return (
            <span key={row.key} className={`deploy-log-line is-${row.tone}${emphasisClass}`}>
              <span className="deploy-log-line-number">{row.number}</span>
              <span className="deploy-log-line-content">
                {segmentGitDiffMarkers(row.text).map(segment => (
                  <span key={segment.key} className={`log-text-${segment.kind}`}>
                    {segment.text}
                  </span>
                ))}
              </span>
            </span>
          )
        })
      )}
    </div>
  )
}
