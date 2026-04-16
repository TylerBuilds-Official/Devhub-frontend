import { useState }         from 'react'

import ParamInput           from './ParamInput'
import {
  initialParamValues,
  serializeParams,
  validateParams,
  type ParamValue,
}                           from './paramHelpers'
import { triggerDeploy }    from '../../api/deploys'
import { ApiError }         from '../../api/client'
import type { PipelineInfo } from '../../types/upstream'
import type { DeployResponse } from '../../types/deploy'


interface DeployFormViewProps {
  projectKey:    string
  projectName:   string
  pipeline:      PipelineInfo
  onClose:       () => void
  onQueued:      (response: DeployResponse) => void
  onViewActive:  (deployId: string) => void
}


interface ConflictState {
  message:  string
  deployId: string | null
}


/**
 * FORM state. Validates params locally, submits to /deploys, transitions
 * the parent to RUNNING on success. Handles 409 lock conflicts inline.
 */
export default function DeployFormView({
  projectKey,
  projectName,
  pipeline,
  onClose,
  onQueued,
  onViewActive,
}: DeployFormViewProps) {
  const [values, setValues]         = useState<Record<string, ParamValue>>(() => initialParamValues(pipeline))
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [fatalError, setFatalError] = useState<string | null>(null)
  const [conflict, setConflict]     = useState<ConflictState | null>(null)

  async function handleSubmit() {
    const validationErrors = validateParams(pipeline.params, values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setFatalError(null)
    setConflict(null)
    setSubmitting(true)

    try {
      const response = await triggerDeploy({
        project_key:  projectKey,
        pipeline_key: pipeline.key,
        params:       serializeParams(pipeline.params, values),
      })

      onQueued(response)

    } catch (err) {
      if (err instanceof ApiError) {
        // Upstream returns 409 with `{job_id_in_progress}` — surface inline.
        if (err.status === 409) {
          setConflict({
            message:  'A deploy is already running for this project.',
            deployId: extractDeployIdFromDetail(err.detail),
          })
        } else {
          setFatalError(err.detail)
        }
      } else {
        setFatalError(err instanceof Error ? err.message : 'Unknown error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="deploy-modal-body">

        {pipeline.description && (
          <p className="deploy-description">{pipeline.description}</p>
        )}

        {/* ── Meta: project / est time ────────────────────────────── */}
        <div className="deploy-meta">
          <div className="deploy-meta-field">
            <span className="deploy-meta-label">Project</span>
            <span className="deploy-meta-value">{projectName}</span>
          </div>
          <div className="deploy-meta-field">
            <span className="deploy-meta-label">Pipeline</span>
            <span className="deploy-meta-value">{pipeline.key}</span>
          </div>
          <div className="deploy-meta-field">
            <span className="deploy-meta-label">Est time</span>
            <span className="deploy-meta-value">~{pipeline.est_seconds}s</span>
          </div>
          <div className="deploy-meta-field">
            <span className="deploy-meta-label">Steps</span>
            <span className="deploy-meta-value">{pipeline.steps.length}</span>
          </div>
        </div>

        {/* ── Conflict error strip ────────────────────────────────── */}
        {conflict && (
          <div className="deploy-error-strip">
            <span className="deploy-error-strip-message">{conflict.message}</span>
            {conflict.deployId && (
              <button
                className="deploy-error-strip-action"
                onClick={() => onViewActive(conflict.deployId!)}
              >
                View
              </button>
            )}
          </div>
        )}

        {/* ── Fatal error strip ───────────────────────────────────── */}
        {fatalError && (
          <div className="deploy-error-strip">
            <span className="deploy-error-strip-message">{fatalError}</span>
          </div>
        )}

        {/* ── Param form ──────────────────────────────────────────── */}
        <div className="deploy-form">
          {pipeline.params.length === 0 && (
            <div className="deploy-form-empty">
              No parameters. Click Deploy to run.
            </div>
          )}

          {pipeline.params.map(param => (
            <div key={param.name} className="deploy-param">
              <div className="deploy-param-label">
                <span>{param.label}</span>
                {param.required && <span className="deploy-param-required">required</span>}
              </div>

              <ParamInput
                param={param}
                value={values[param.name]}
                onChange={next => setValues(v => ({ ...v, [param.name]: next }))}
                error={errors[param.name]}
              />

              {errors[param.name] && (
                <span className="deploy-param-error">{errors[param.name]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="deploy-modal-footer">
        <span />
        <div className="deploy-modal-footer-actions">
          <button className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Queuing...' : 'Deploy'}
          </button>
        </div>
      </div>
    </>
  )
}


/**
 * UpdateSuite's 409 detail is a Python-formatted exception string like:
 *   "App fabcore already has a running job: 8f7a..."
 * Extract the trailing token that looks like a UUID-ish id.
 */
function extractDeployIdFromDetail(detail: string): string | null {
  const match = detail.match(/([0-9a-f-]{8,})\s*$/i)
  return match?.[1] ?? null
}
