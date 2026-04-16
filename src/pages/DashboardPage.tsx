import { useCallback }              from 'react'
import { useNavigate, useParams }   from 'react-router-dom'

import Header              from '../components/global/Header'
import LoadingSpinner      from '../components/global/LoadingSpinner'
import EmptyState          from '../components/global/EmptyState'
import RefreshButton       from '../components/global/RefreshButton'
import ProjectRow          from '../components/dashboard/ProjectRow'
import DetailPane          from '../components/dashboard/DetailPane'
import SystemStatusStrip   from '../components/dashboard/SystemStatusStrip'
import { useApi }          from '../hooks/useApi'
import { getProjects }     from '../api/projects'

import '../styles/dashboard.css'


/**
 * Dashboard page — project list on the left, selected project detail on
 * the right. URL-driven selection: `/projects/:projectKey` deep-links to
 * a specific project; `/` falls back to the first project in the registry.
 *
 * Auto-refreshes /projects every 30s, pausing when the tab is hidden.
 */
export default function DashboardPage() {
  const { projectKey } = useParams<{ projectKey?: string }>()
  const navigate       = useNavigate()

  const { data, loading, error, refetch } = useApi(
    () => getProjects(),
    [],
    { intervalMs: 30_000 },
  )

  const projects = data?.projects ?? []

  // URL is the source of truth for selection. If the URL key doesn't match
  // any project, fall back silently to the first project so we never show a
  // broken state on a stale/shared link.
  const urlMatches   = projects.find(p => p.key === projectKey) ?? null
  const effective    = urlMatches ?? projects[0] ?? null
  const effectiveKey = effective?.key ?? null

  const handleSelect = useCallback((key: string) => {
    navigate(`/projects/${key}`)
  }, [navigate])

  return (
    <>
      <Header title="DevHub" subtitle="Project ops">
        <RefreshButton onClick={refetch} spinning={loading} />
        <SystemStatusStrip />
      </Header>

      {loading && !data && <LoadingSpinner message="Loading projects..." />}

      {error && !data && (
        <EmptyState title="Couldn't load projects" message={error} />
      )}

      {data && (
        <div className="dashboard">

          {/* ── Left pane ─────────────────────────────────────────── */}
          <aside className="projects-pane">
            <div className="projects-pane-header">
              <h2>Projects</h2>
              <span className="projects-pane-count">
                {projects.length.toString().padStart(2, '0')}
              </span>
            </div>

            <div>
              {projects.map(p => (
                <ProjectRow
                  key={p.key}
                  project={p}
                  isSelected={p.key === effectiveKey}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </aside>

          {/* ── Right pane ────────────────────────────────────────── */}
          {effective ? (
            <DetailPane project={effective} />
          ) : (
            <div className="detail-empty">
              <span className="marker">—</span> select a project
            </div>
          )}
        </div>
      )}
    </>
  )
}
