import { useNavigate }   from 'react-router-dom'

import { formatElapsed } from '../../hooks/useElapsedSeconds'
import DeployLogTail    from './DeployLogTail'
import type { JobDetail } from '../../types/job'


interface DeployDoneViewProps {
  job:        JobDetail
  logLines:   string[]
  totalSecs:  number
  onClose:    () => void
}


/**
 * DONE state. Shows final outcome, total duration, tail of the log, and a
 * "View full log" link that deep-links to JobDetailPage. User-dismissed only.
 */
export default function DeployDoneView({ job, logLines, totalSecs, onClose }: DeployDoneViewProps) {
  const navigate = useNavigate()

  const statusCls   = job.status.toLowerCase()
  const statusLabel = job.status.toUpperCase()

  return (
    <>
      <div className="deploy-modal-body">

        <div className="deploy-done">

          <div className="deploy-running-header">
            <span className={`deploy-running-status status-token ${statusCls}`}>
              {statusLabel}
            </span>
            <span className="deploy-running-elapsed">
              {formatElapsed(totalSecs)} total
            </span>
          </div>

          <div className="deploy-done-summary">
            <div>
              <span className="deploy-done-field-label">Pipeline</span>
              <span className="deploy-done-field-value">{job.pipeline_key}</span>
            </div>
            <div>
              <span className="deploy-done-field-label">Steps completed</span>
              <span className="deploy-done-field-value">
                {job.current_step} / {job.total_steps}
              </span>
            </div>
            <div>
              <span className="deploy-done-field-label">Deploy ID</span>
              <span className="deploy-done-field-value">
                {job.deploy_id.slice(0, 8)}…
              </span>
            </div>
            <div>
              <span className="deploy-done-field-label">Triggered by</span>
              <span className="deploy-done-field-value">{job.triggered_by}</span>
            </div>
          </div>

          {job.error && (
            <div className="deploy-done-error">{job.error}</div>
          )}

          <DeployLogTail lines={logLines} emptyText="No log output captured." />
        </div>
      </div>

      <div className="deploy-modal-footer">
        <button
          className="btn-secondary"
          onClick={() => navigate(`/jobs/${job.deploy_id}`)}
        >
          Open full detail
        </button>
        <div className="deploy-modal-footer-actions">
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  )
}
