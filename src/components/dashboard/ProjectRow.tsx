import type { ProjectInfo } from '../../types/project'


interface ProjectRowProps {
  project:     ProjectInfo
  isSelected:  boolean
  onSelect:    (key: string) => void
}


/**
 * A project list row — reads like a title-block cell on a shop drawing.
 * Left: status indicator dot. Middle: name + meta. Right: status word.
 */
export default function ProjectRow({ project, isSelected, onSelect }: ProjectRowProps) {
  const status      = project.health?.status ?? null
  const indicatorCls = status ? status.toLowerCase() : 'none'

  const statusLabel = project.health_url === null
    ? '—'
    : (status ?? 'unknown').toUpperCase()

  const statusCls   = project.health_url === null
    ? 'unknown'
    : (status ?? 'unknown').toLowerCase()

  return (
    <div
      className={`project-row ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelect(project.key)}
    >
      <span className={`project-row-indicator ${indicatorCls}`} />

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
