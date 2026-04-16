import { useCallback, useState } from 'react'
import { useNavigate }           from 'react-router-dom'

import DeployFormView     from './DeployFormView'
import DeployRunningView  from './DeployRunningView'
import DeployDoneView     from './DeployDoneView'
import type { DeployResponse } from '../../types/deploy'
import type { JobDetail }      from '../../types/job'
import type { PipelineInfo }   from '../../types/upstream'


interface DeployModalProps {
  projectKey:   string
  projectName:  string
  pipeline:     PipelineInfo
  onClose:      () => void    // parent closes + refetches its data
}


type ModalState =
  | { kind: 'form' }
  | { kind: 'running', deployId: string, startedAt: number }
  | { kind: 'done',    job: JobDetail, logLines: string[], totalSecs: number }


/**
 * Deploy modal state machine.
 *
 *   form  -- Deploy pressed -->  running  -- terminal status -->  done
 *     ^-- 409 conflict with    ^-- Close: parent onClose       ^-- Close: parent onClose
 *         View link (parent
 *         navigates to job)
 */
export default function DeployModal({
  projectKey,
  projectName,
  pipeline,
  onClose,
}: DeployModalProps) {
  const navigate = useNavigate()
  const [state, setState] = useState<ModalState>({ kind: 'form' })

  const handleQueued = useCallback((res: DeployResponse) => {
    setState({
      kind:      'running',
      deployId:  res.deploy_id,
      startedAt: Date.now(),
    })
  }, [])

  const handleTerminal = useCallback((job: JobDetail, logLines: string[]) => {
    setState(prev => {
      const startedAt = prev.kind === 'running' ? prev.startedAt : Date.now()
      const totalSecs = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))

      return { kind: 'done', job, logLines, totalSecs }
    })
  }, [])

  const handleViewActive = useCallback((deployId: string) => {
    navigate(`/jobs/${deployId}`)
    onClose()
  }, [navigate, onClose])

  return (
    <div className="deploy-modal-backdrop" onClick={onClose}>
      <div className="deploy-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header stays constant across states ────────────────── */}
        <div className="deploy-modal-header">
          <span className="deploy-modal-title">Deploy · {pipeline.display_name}</span>
          <span className="deploy-modal-subtitle">{projectKey} / {pipeline.key}</span>
        </div>

        {/* ── State-specific body + footer ───────────────────────── */}
        {state.kind === 'form' && (
          <DeployFormView
            projectKey={projectKey}
            projectName={projectName}
            pipeline={pipeline}
            onClose={onClose}
            onQueued={handleQueued}
            onViewActive={handleViewActive}
          />
        )}

        {state.kind === 'running' && (
          <DeployRunningView
            deployId={state.deployId}
            startedAt={state.startedAt}
            onTerminal={handleTerminal}
            onClose={onClose}
          />
        )}

        {state.kind === 'done' && (
          <DeployDoneView
            job={state.job}
            logLines={state.logLines}
            totalSecs={state.totalSecs}
            onClose={onClose}
          />
        )}

      </div>
    </div>
  )
}
