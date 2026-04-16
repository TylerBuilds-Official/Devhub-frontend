import { useState }                  from 'react'

import { useApi }                    from '../../hooks/useApi'
import { getUpstreamApps }           from '../../api/upstream'
import { getJobs }                   from '../../api/jobs'
import { absoluteTime, relativeTime } from '../../utils/time'
import JobsTable                     from '../jobs/JobsTable'
import DeployModal                   from '../deploy/DeployModal'
import type { ProjectInfo }          from '../../types/project'
import type { PipelineInfo, UpstreamAppInfo } from '../../types/upstream'


interface DetailPaneProps {
  project: ProjectInfo
}


function Field({ label, value, dim = false }: { label: string, value: string, dim?: boolean }) {

  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      <span className={`detail-field-value ${dim ? 'dim' : ''}`}>{value}</span>
    </div>
  )
}


export default function DetailPane({ project }: DetailPaneProps) {
  const { data: appsData } = useApi(() => getUpstreamApps(), [])

  const { data: recentDeploysData, refetch: refetchRecent } = useApi(
    () => getJobs(10, project.key),
    [project.key],
  )

  const [activePipeline, setActivePipeline] = useState<PipelineInfo | null>(null)

  const upstreamApp: UpstreamAppInfo | undefined = project.updatesuite_app
    ? appsData?.apps.find(a => a.key === project.updatesuite_app)
    : undefined

  const recentDeploys = recentDeploysData?.jobs ?? []

  const health = project.health
  const status = health?.status ?? null

  const statusLabel = project.health_url === null
    ? '—'
    : (status ?? 'unknown').toUpperCase()

  const statusCls = project.health_url === null
    ? 'unknown'
    : (status ?? 'unknown').toLowerCase()

  function handleModalClose() {
    setActivePipeline(null)
    refetchRecent()
  }

  return (
    <div className="detail-pane">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="detail-header">
        <div className="detail-header-row">
          <h1>{project.display_name}</h1>
          <span className="detail-header-key">{project.key}</span>
        </div>

        {project.description && (
          <p className="detail-header-desc">{project.description}</p>
        )}

        <div className="detail-header-badges">
          <span className="detail-badge">{project.category}</span>
          {project.tags.map(t => (
            <span key={t} className="detail-badge">{t}</span>
          ))}
        </div>
      </header>

      {/* ── Title-block fields ─────────────────────────────────────── */}
      <div className="detail-fields">
        <div className="detail-field">
          <span className="detail-field-label">Status</span>
          <span className={`status-token ${statusCls}`} style={{ fontSize: 13 }}>
            {statusLabel}
          </span>
        </div>

        <Field
          label="Latency"
          value={health?.latency_ms != null ? `${health.latency_ms}ms` : '—'}
          dim={health?.latency_ms == null}
        />

        <Field
          label="Checked"
          value={relativeTime(health?.checked_at)}
          dim={!health?.checked_at}
        />

        <Field
          label="Health URL"
          value={project.health_url ?? 'none'}
          dim={!project.health_url}
        />

        <Field
          label="Repo"
          value={project.repo ?? 'no repo linked'}
          dim={!project.repo}
        />

        <Field
          label="UpdateSuite"
          value={project.updatesuite_app ?? 'no pipelines'}
          dim={!project.updatesuite_app}
        />
      </div>

      {/* ── Deploy actions ─────────────────────────────────────────── */}
      {upstreamApp && upstreamApp.pipelines.length > 0 && (
        <section className="detail-section">
          <div className="detail-section-header">
            <h2>Deploy</h2>
            <span className="count">
              {upstreamApp.pipelines.length} pipeline{upstreamApp.pipelines.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="deploy-actions">
            {upstreamApp.pipelines.map(p => (
              <button
                key={p.key}
                className="btn-primary"
                title={p.description}
                onClick={() => setActivePipeline(p)}
              >
                {p.display_name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent deploys ─────────────────────────────────────────── */}
      <section className="detail-section">
        <div className="detail-section-header">
          <h2>Recent deploys</h2>
          <span className="count">{recentDeploys.length}</span>
        </div>

        <JobsTable jobs={recentDeploys} showProject={false} compact />
      </section>

      {/* ── Health check snapshot ──────────────────────────────────── */}
      {health && (
        <section className="detail-section">
          <div className="detail-section-header">
            <h2>Last health check</h2>
            <span className="count">{absoluteTime(health.checked_at)}</span>
          </div>

          <div className="detail-fields">
            <Field
              label="HTTP"
              value={health.status_code != null ? String(health.status_code) : '—'}
              dim={health.status_code == null}
            />
            <Field
              label="Latency"
              value={health.latency_ms != null ? `${health.latency_ms}ms` : '—'}
              dim={health.latency_ms == null}
            />
            <Field
              label="Error"
              value={health.error ?? 'none'}
              dim={!health.error}
            />
          </div>
        </section>
      )}

      {/* ── Deploy modal ───────────────────────────────────────────── */}
      {activePipeline && (
        <DeployModal
          projectKey={project.key}
          projectName={project.display_name}
          pipeline={activePipeline}
          onClose={handleModalClose}
        />
      )}

    </div>
  )
}
