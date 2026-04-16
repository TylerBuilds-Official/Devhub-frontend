import { useEffect, useRef, useState } from 'react'

import { getJob, getJobLog }           from '../../api/jobs'
import { formatElapsed, useElapsedSeconds } from '../../hooks/useElapsedSeconds'
import DeployLogTail                   from './DeployLogTail'
import type { JobDetail }              from '../../types/job'


interface DeployRunningViewProps {
  deployId:   string
  startedAt:  number                             // millis, from parent's Date.now()
  onTerminal: (job: JobDetail, log: string[]) => void
  onClose:    () => void
}


const POLL_INTERVAL_MS = 2_000
const TERMINAL_STATUSES = new Set(['success', 'failed'])


/**
 * RUNNING state. Polls job + log every 2s, hands control back to the modal
 * when status hits a terminal value.
 *
 * Close button does NOT cancel the deploy — it just closes the modal. The
 * deploy keeps running and appears in the global Jobs view.
 */
export default function DeployRunningView({
  deployId,
  startedAt,
  onTerminal,
  onClose,
}: DeployRunningViewProps) {
  const [job, setJob]         = useState<JobDetail | null>(null)
  const [logLines, setLines]  = useState<string[]>([])
  const [pollError, setErr]   = useState<string | null>(null)

  const elapsed = useElapsedSeconds(startedAt)
  const stopped = useRef(false)

  // Single polling loop (pair of calls per tick) so they stay in lockstep.
  useEffect(() => {
    stopped.current = false

    async function tick() {
      if (stopped.current) return

      try {
        const [nextJob, nextLog] = await Promise.all([
          getJob(deployId),
          getJobLog(deployId),
        ])

        if (stopped.current) return

        setJob(nextJob)
        setLines(nextLog.lines)
        setErr(null)

        if (TERMINAL_STATUSES.has(nextJob.status)) {
          stopped.current = true
          onTerminal(nextJob, nextLog.lines)
          return
        }

      } catch (err) {
        if (stopped.current) return
        setErr(err instanceof Error ? err.message : 'Upstream lookup failed')
      }
    }

    tick()
    const id = setInterval(tick, POLL_INTERVAL_MS)

    return () => {
      stopped.current = true
      clearInterval(id)
    }
  }, [deployId, onTerminal])

  const currentStep  = job?.current_step ?? 0
  const totalSteps   = job?.total_steps  ?? 0
  const stepLabel    = job?.current_step_label ?? (job?.status ?? 'Starting...')
  const progressPct  = totalSteps > 0 ? Math.min(100, (currentStep / totalSteps) * 100) : 10
  const statusCls    = (job?.status ?? 'queued').toLowerCase()
  const statusLabel  = (job?.status ?? 'queued').toUpperCase()

  return (
    <>
      <div className="deploy-modal-body">

        <div className="deploy-running-header">
          <span className={`deploy-running-status status-token ${statusCls}`}>
            {statusLabel}
          </span>
          <span className="deploy-running-elapsed">{formatElapsed(elapsed)} elapsed</span>
        </div>

        <div className="deploy-step-progress">
          <div className="deploy-step-header">
            <span className="deploy-step-counter">
              Step {currentStep} / {totalSteps || '—'}
            </span>
            <span className="deploy-step-label">{stepLabel}</span>
          </div>
          <div className="deploy-progress-bar">
            <div className="deploy-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <DeployLogTail
          lines={logLines}
          emptyText={pollError ?? 'Waiting for log output...'}
        />
      </div>

      <div className="deploy-modal-footer">
        <span className="deploy-running-elapsed">
          Deploy continues running if you close.
        </span>
        <div className="deploy-modal-footer-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  )
}
