/**
 * PipelineDetails — reference documentation for what a project's
 * UpdateSuite pipelines actually do.
 *
 * Every field rendered here is sourced from the pipeline's Python
 * class at import time (DISPLAY_NAME, DESCRIPTION, EST_SECONDS,
 * PARAMS, update_steps) — step labels come from each step method's
 * docstring first line. So this section always reflects the code,
 * not hand-maintained docs.
 *
 * Collapsed by default because the step list gets long; expands on
 * header click with a smooth grid-row animation.
 */
import { useState }                              from 'react'
import { ChevronRight }                          from 'lucide-react'

import type { UpstreamAppInfo, PipelineInfo }    from '../../types/upstream'


interface PipelineDetailsProps {
  upstreamApp: UpstreamAppInfo
}


function formatDuration(seconds: number): string {
  if (seconds < 60)    return `~${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `~${m}m` : `~${m}m ${s}s`
}


function PipelineBlock({ pipeline }: { pipeline: PipelineInfo }) {

  return (
    <article className="pipeline-block">
      <header className="pipeline-block-header">
        <h3>{pipeline.display_name}</h3>
        <span className="pipeline-block-duration">{formatDuration(pipeline.est_seconds)}</span>
      </header>

      {pipeline.description && (
        <p className="pipeline-block-description">{pipeline.description}</p>
      )}

      {pipeline.steps.length > 0 && (
        <ol className="pipeline-block-steps">
          {pipeline.steps.map((step, idx) => (
            <li key={step.name}>
              <span className="pipeline-step-index">{String(idx + 1).padStart(2, '0')}</span>
              <span className="pipeline-step-label">{step.label}</span>
            </li>
          ))}
        </ol>
      )}

      {pipeline.params.length > 0 && (
        <div className="pipeline-block-params">
          <span className="label">Params</span>
          <ul>
            {pipeline.params.map(p => (
              <li key={p.name}>
                <code>{p.name}</code>
                <span className="pipeline-param-type">{p.type}{p.required ? '' : '?'}</span>
                {p.label && <span className="pipeline-param-label">— {p.label}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}


export default function PipelineDetails({ upstreamApp }: PipelineDetailsProps) {
  const [open, setOpen] = useState(false)

  if (upstreamApp.pipelines.length === 0) {
    return null
  }

  const heading = upstreamApp.pipelines.length === 1 ? 'Pipeline' : 'Pipelines'
  const count   = upstreamApp.pipelines.length

  return (
    <section className="detail-section">
      <button
        type="button"
        className={`detail-section-header collapsible-header ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className="collapsible-title">
          <ChevronRight size={14} className="collapsible-chevron" />
          <h2>{heading}</h2>
        </span>
        <span className="count">
          {count} {count === 1 ? 'pipeline' : 'pipelines'}
        </span>
      </button>

      <div className={`collapsible ${open ? 'is-open' : ''}`}>
        <div className="collapsible-inner">
          <div className="pipeline-blocks">
            {upstreamApp.pipelines.map(p => (
              <PipelineBlock key={p.key} pipeline={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
