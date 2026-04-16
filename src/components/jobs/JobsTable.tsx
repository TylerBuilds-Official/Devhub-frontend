import { useNavigate }      from 'react-router-dom'
import { relativeTime }     from '../../utils/time'
import type { JobSummary }  from '../../types/job'


interface JobsTableProps {
  jobs:          JobSummary[]
  showProject?:  boolean    // hide when rendered inside a single-project context
  compact?:      boolean    // drop padding + hide triggered-by for inline use
}


/**
 * Mono table of deploys. Reused between JobsPage (global) and DetailPane
 * (project-scoped). Toggle `showProject` off when rendering inside a single
 * project's detail pane.
 */
export default function JobsTable({ jobs, showProject = true, compact = false }: JobsTableProps) {
  const navigate = useNavigate()

  if (jobs.length === 0) {
    return (
      <table className={`deploys-table ${compact ? 'is-compact' : ''}`}>
        <thead>
          <tr>
            <th>When</th>
            {showProject && <th>Project</th>}
            <th>Pipeline</th>
            <th>Status</th>
            {!compact && <th>By</th>}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="dim" colSpan={showProject ? (compact ? 4 : 5) : (compact ? 3 : 4)}>
              No deploys yet.
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  return (
    <table className={`deploys-table ${compact ? 'is-compact' : ''}`}>
      <thead>
        <tr>
          <th>When</th>
          {showProject && <th>Project</th>}
          <th>Pipeline</th>
          <th>Status</th>
          {!compact && <th>By</th>}
        </tr>
      </thead>
      <tbody>
        {jobs.map(job => (
          <tr
            key={job.deploy_id}
            className="deploys-row"
            onClick={() => navigate(`/jobs/${job.deploy_id}`)}
          >
            <td className="mono-dim">{relativeTime(job.started_at ?? job.finished_at)}</td>
            {showProject && <td>{job.project_key}</td>}
            <td>{job.pipeline_key}</td>
            <td>
              <span className={`status-token ${job.status.toLowerCase()}`}>
                {job.status.toUpperCase()}
              </span>
            </td>
            {!compact && <td className="dim">{job.triggered_by}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
