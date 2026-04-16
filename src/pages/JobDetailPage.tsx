import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams }  from 'react-router-dom'

import Header                          from '../components/global/Header'
import LoadingSpinner                  from '../components/global/LoadingSpinner'
import EmptyState                      from '../components/global/EmptyState'
import RefreshButton                   from '../components/global/RefreshButton'
import SystemStatusStrip               from '../components/dashboard/SystemStatusStrip'
import DeployLogTail                   from '../components/deploy/DeployLogTail'
import { getJob, getJobLog }           from '../api/jobs'
import { ApiError }                    from '../api/client'
import { formatElapsed, useElapsedSeconds } from '../hooks/useElapsedSeconds'
import { absoluteTime, relativeTime }  from '../utils/time'
import type { JobDetail }              from '../types/job'


const POLL_INTERVAL_MS = 2_000
const TERMINAL_STATUSES = new Set(['success', 'failed'])


interface FieldProps {
  label: string
  value: string
  dim?:  boolean
  mono?: boolean
}


function Field({ label, value, dim = false, mono = true }: FieldProps) {

  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      <span
        className={`detail-field-value ${dim ? 'dim' : ''}`}
        style={mono ? undefined : { fontFamily: 'var(--font-display)' }}
      >
        {value}
      </span>
    </div>
  )
}


export default function JobDetailPage() {
  const { id: deployId } = useParams<{ id: string }>()
  const navigate         = useNavigate()

  const [job, setJob]         = useState<JobDetail | null>(null)
  const [logLines, setLines]  = useState<string[]>([])
  const [logError, setLogErr] = useState<string | null>(null)
  const [loadError, setLoadErr] = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const stopped = useRef(false)

  const fetchOnce = useCallback(async () => {
    if (!deployId) return

    try {
      const nextJob = await getJob(deployId)
      if (stopped.current) return

      setJob(nextJob)
      setLoadErr(null)

      // Log may legitimately fail if upstream has evicted the job buffer.
      // We don't let that fail the whole page.
      try {
        const nextLog = await getJobLog(deployId)
        if (stopped.current) return
        setLines(nextLog.lines)
        setLogErr(null)
      } catch (err) {
        if (stopped.current) return
        setLogErr(err instanceof Error ? err.message : 'Log unavailable')
      }

    } catch (err) {
      if (stopped.current) return
      if (err instanceof ApiError && err.status === 404) {
        setLoadErr(`No deploy with id ${deployId}`)
      } else {
        setLoadErr(err instanceof Error ? err.message : 'Failed to load deploy')
      }
    } finally {
      if (!stopped.current) setLoading(false)
    }
  }, [deployId])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchOnce()
    } finally {
      setRefreshing(false)
    }
  }, [fetchOnce])

  // Initial fetch + polling while non-terminal.
  useEffect(() => {
    stopped.current = false
    fetchOnce()

    return () => { stopped.current = true }
  }, [fetchOnce])

  useEffect(() => {
    if (!job) return
    if (TERMINAL_STATUSES.has(job.status)) return

    const id = setInterval(fetchOnce, POLL_INTERVAL_MS)

    return () => clearInterval(id)
  }, [job, fetchOnce])


  // ── Derive elapsed ────────────────────────────────────────────────────
  //
  // If the deploy is still running, tick a live counter. If it's terminal,
  // freeze at the final duration derived from started_at / finished_at.
  const isTerminal = job ? TERMINAL_STATUSES.has(job.status) : false

  const liveStartMs = (!isTerminal && job?.started_at)
    ? new Date(job.started_at).getTime()
    : null
  const liveElapsed = useElapsedSeconds(liveStartMs)

  const finalElapsed = (job?.started_at && job?.finished_at)
    ? Math.max(0, Math.floor(
        (new Date(job.finished_at).getTime() - new Date(job.started_at).getTime()) / 1000
      ))
    : null

  const elapsed = isTerminal ? (finalElapsed ?? 0) : liveElapsed


  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <Header title="Job" subtitle="Deploy detail">
        <RefreshButton onClick={handleRefresh} spinning={refreshing || (loading && !job)} />
        <SystemStatusStrip />
      </Header>

      <div className="job-detail-page">

        {/* Breadcrumb */}
        <div className="job-detail-breadcrumb">
          <Link to="/jobs">Jobs</Link>
          <span className="sep">/</span>
          <span>{deployId?.slice(0, 8) ?? '—'}</span>
        </div>

        {loading && !job && <LoadingSpinner message="Loading deploy..." />}

        {!loading && loadError && !job && (
          <EmptyState title="Couldn't load deploy" message={loadError}>
            <button
              className="btn-secondary"
              style={{ marginTop: 16 }}
              onClick={() => navigate('/jobs')}
            >
              Back to jobs
            </button>
          </EmptyState>
        )}

        {job && (
          <>

            {/* ── Hero ─────────────────────────────────────────── */}
            <div className="job-detail-hero">
              <div className="job-detail-hero-primary">
                <span className={`job-detail-hero-status ${job.status.toLowerCase()}`}>
                  {job.status.toUpperCase()}
                </span>
                <span className="job-detail-hero-sub">
                  {job.project_key} / {job.pipeline_key}
                </span>
              </div>

              <div className="job-detail-hero-right">
                <span className="job-detail-hero-elapsed">
                  {formatElapsed(elapsed)}
                </span>
                <span className="job-detail-hero-elapsed-label">
                  {isTerminal ? 'Total' : 'Elapsed'}
                </span>
              </div>
            </div>

            {/* ── Progress (only while running) ────────────────── */}
            {!isTerminal && (
              <section className="job-detail-section">
                <div className="job-detail-section-header">
                  <h2>Progress</h2>
                  <span className="count">
                    Step {job.current_step} / {job.total_steps || '—'}
                  </span>
                </div>

                <div className="job-detail-progress">
                  <div className="deploy-step-header">
                    <span className="deploy-step-counter">
                      {job.current_step_label || 'Starting...'}
                    </span>
                    <span className="deploy-step-label">
                      {job.total_steps > 0
                        ? `${Math.round((job.current_step / job.total_steps) * 100)}%`
                        : '—'}
                    </span>
                  </div>
                  <div className="deploy-progress-bar">
                    <div
                      className="deploy-progress-fill"
                      style={{
                        width: job.total_steps > 0
                          ? `${Math.min(100, (job.current_step / job.total_steps) * 100)}%`
                          : '10%',
                      }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* ── Summary fields ───────────────────────────────── */}
            <section className="job-detail-section">
              <div className="job-detail-section-header">
                <h2>Summary</h2>
              </div>

              <div className="job-detail-fields">
                <Field label="Deploy ID"       value={job.deploy_id} />
                <Field label="Upstream Job"    value={job.upstream_job_id} />
                <Field label="Project"         value={job.project_key} />
                <Field label="Pipeline"        value={job.pipeline_key} />
                <Field label="Triggered by"    value={job.triggered_by} dim={job.triggered_by === 'anonymous'} />
                <Field
                  label="Started"
                  value={job.started_at ? `${absoluteTime(job.started_at)} (${relativeTime(job.started_at)})` : '—'}
                  dim={!job.started_at}
                />
                <Field
                  label="Finished"
                  value={job.finished_at ? `${absoluteTime(job.finished_at)} (${relativeTime(job.finished_at)})` : '—'}
                  dim={!job.finished_at}
                />
                <Field
                  label="Steps completed"
                  value={`${job.current_step} / ${job.total_steps || '—'}`}
                />
              </div>
            </section>

            {/* ── Params (if any) ──────────────────────────────── */}
            {Object.keys(job.params).length > 0 && (
              <section className="job-detail-section">
                <div className="job-detail-section-header">
                  <h2>Parameters</h2>
                  <span className="count">{Object.keys(job.params).length}</span>
                </div>

                <div className="job-detail-fields">
                  {Object.entries(job.params).map(([k, v]) => (
                    <Field key={k} label={k} value={String(v)} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Error (if failed) ────────────────────────────── */}
            {job.error && (
              <section className="job-detail-section">
                <div className="job-detail-section-header">
                  <h2>Error</h2>
                </div>
                <div className="job-detail-error">{job.error}</div>
              </section>
            )}

            {/* ── Log ──────────────────────────────────────────── */}
            <section className="job-detail-section">
              <div className="job-detail-section-header">
                <h2>Log</h2>
                <span className="count">
                  {logLines.length || (logError ? 'unavailable' : '—')}
                </span>
              </div>

              <div className="job-detail-log-tail">
                <DeployLogTail
                  lines={logLines}
                  emptyText={
                    logError
                      ? `Log no longer available upstream: ${logError}`
                      : 'No log output captured.'
                  }
                  height="100%"
                />
              </div>
            </section>

          </>
        )}
      </div>
    </>
  )
}
