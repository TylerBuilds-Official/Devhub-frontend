import { useEffect, useRef } from 'react'


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

  return (
    <div className="deploy-log-tail" ref={ref} style={style}>
      {lines.length === 0 ? (
        <span className="deploy-log-empty">
          {emptyText ?? 'No log output.'}
        </span>
      ) : (
        lines.map((line, i) => (
          <span key={i} className="deploy-log-line">{line}</span>
        ))
      )}
    </div>
  )
}
