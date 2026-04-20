/**
 * Empty-state project picker.
 *
 * Shown in the detail pane when no project is selected — the user just
 * landed on `/` or deep-linked to a URL that doesn't match any known
 * project. Renders a horizontal, card-shaped version of the sidebar
 * list so picking a project is a single click rather than a scan of
 * the narrow left column.
 */
import { Monitor, ArrowRight } from 'lucide-react'

import { relativeTime }        from '../../utils/time'
import type { ProjectInfo }    from '../../types/project'


interface ProjectCardsProps {
  projects: ProjectInfo[]
  onSelect: (key: string) => void
}


export default function ProjectCards({ projects, onSelect }: ProjectCardsProps) {

  if (projects.length === 0) {
    return (
      <div className="project-cards-empty">
        <span className="label">No projects</span>
        <p>The registry is empty. Add entries to <code>resources/registry.json</code> and restart DevHubAPI.</p>
      </div>
    )
  }

  return (
    <div className="project-cards">
      <header className="project-cards-intro">
        <h1>Pick a project</h1>
        <p>Or use the list on the left.</p>
      </header>

      <div className="project-cards-grid">
        {projects.map(p => (
          <ProjectCard key={p.key} project={p} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}


function ProjectCard({ project, onSelect }: { project: ProjectInfo, onSelect: (key: string) => void }) {
  const status        = project.health?.status ?? null
  const isDesktopApp  = project.category === 'desktop' && project.health_url === null

  let statusLabel: string
  let statusCls:   string

  if (isDesktopApp) {
    statusLabel = project.last_deploy_at ? relativeTime(project.last_deploy_at) : 'NEVER'
    statusCls   = 'deploy-time'
  }
  else if (project.health_url === null) {
    statusLabel = '—'
    statusCls   = 'unknown'
  }
  else {
    statusLabel = (status ?? 'unknown').toUpperCase()
    statusCls   = (status ?? 'unknown').toLowerCase()
  }

  const indicatorCls = status ? status.toLowerCase() : 'none'

  return (
    <button className="project-card" onClick={() => onSelect(project.key)} title={project.description || undefined}>
      <span className="project-card-marker">
        {isDesktopApp
          ? <Monitor size={14} strokeWidth={1.5} />
          : <span className={`project-card-dot ${indicatorCls}`} />
        }
      </span>

      <span className="project-card-name">{project.display_name}</span>

      <span className="project-card-meta">
        <span>{project.category.toUpperCase()}</span>
        {project.updatesuite_app && (
          <>
            <span className="sep">·</span>
            <span>{project.updatesuite_app}</span>
          </>
        )}
      </span>

      {project.description && (
        <span className="project-card-desc">{project.description}</span>
      )}

      <span className={`project-card-status status-token ${statusCls}`}>{statusLabel}</span>

      <ArrowRight size={14} className="project-card-arrow" />
    </button>
  )
}
