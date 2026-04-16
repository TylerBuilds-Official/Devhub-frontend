import { useState }          from 'react'

import Header                from '../components/global/Header'
import LoadingSpinner        from '../components/global/LoadingSpinner'
import EmptyState            from '../components/global/EmptyState'
import RefreshButton         from '../components/global/RefreshButton'
import JobsTable             from '../components/jobs/JobsTable'
import SystemStatusStrip     from '../components/dashboard/SystemStatusStrip'
import { useApi }            from '../hooks/useApi'
import { getJobs }           from '../api/jobs'
import { getProjects }       from '../api/projects'


export default function JobsPage() {
  const [projectFilter, setProjectFilter] = useState<string>('')

  const {
    data: projectsData,
  } = useApi(() => getProjects(), [])

  const {
    data:    jobsData,
    loading,
    error,
    refetch,
  } = useApi(
    () => getJobs(100, projectFilter || undefined),
    [projectFilter],
  )

  const projects = projectsData?.projects ?? []
  const jobs     = jobsData?.jobs         ?? []

  return (
    <>
      <Header title="Jobs" subtitle="Deploy history">
        <RefreshButton onClick={refetch} spinning={loading} />
        <SystemStatusStrip />
      </Header>

      <div className="jobs-page">

        {/* ── Filter bar ───────────────────────────────────────────── */}
        <div className="jobs-filter-bar">
          <span className="label">Project</span>
          <select
            className="jobs-filter-select"
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
          >
            <option value="">All projects</option>
            {projects.map(p => (
              <option key={p.key} value={p.key}>
                {p.display_name}
              </option>
            ))}
          </select>

          <span className="jobs-count">
            {jobs.length.toString().padStart(3, '0')} deploys
          </span>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        {loading && !jobsData && <LoadingSpinner message="Loading jobs..." />}

        {error && !jobsData && (
          <EmptyState title="Couldn't load jobs" message={error} />
        )}

        {jobsData && (
          <JobsTable jobs={jobs} showProject={!projectFilter} />
        )}
      </div>
    </>
  )
}
