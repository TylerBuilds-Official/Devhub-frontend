import { Monitor }             from 'lucide-react'

import { relativeTime }        from '../../utils/time'
import type { ProjectInfo }    from '../../types/project'


interface ProjectRowProps {
  project:     ProjectInfo
  isSelected:  boolean
  onSelect:    (key: string) => void
}


/**
 * A project list row — reads like a title-block cell on a shop drawing.
 * Left: status indicator dot (or desktop-app icon for un-probeable projects).
 * Middle: name + meta. Right: status word (or relative last-deploy time
 * for desktop apps, since "UP/DOWN" is meaningless without a probe).
 */
export default function ProjectRow({ project, isSelected, onSelect }: ProjectRowProps) {
  const status         = project.health?.status ?? null
  const indicatorCls   = status ? status.toLowerCase() : 'none'
  const isDesktopApp   = project.category === 'desktop' && project.health_url === null

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

  return (
    <div
      className={`project-row ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelect(project.key)}
    >
      {isDesktopApp
        ? <Monitor className="project-row-icon" size={12} strokeWidth={1.5} aria-label="Desktop app" />
        : <span className={`project-row-indicator ${indicatorCls}`} />
      }

      <div className="project-row-body">
        <span className="project-row-name">{project.display_name}</span>
        <span className="project-row-meta">
          <span>{project.category.toUpperCase()}</span>
          {project.updatesuite_app && (
            <>
              <span className="sep">·</span>
              <span>{project.updatesuite_app}</span>
            </>
          )}
        </span>
      </div>

      <span className={`project-row-status status-token ${statusCls}`}>
        {statusLabel}
      </span>
    </div>
  )
}
