import { useApi }          from '../../hooks/useApi'
import { getSystemStatus } from '../../api/system'
import type { UpstreamCheck } from '../../types/system'


function Check({ check }: { check: UpstreamCheck }) {
  const cls = check.status.toLowerCase()

  return (
    <div className="system-check" title={check.error ?? ''}>
      <span className={`system-check-dot ${cls}`} />
      <span>{check.name}</span>
    </div>
  )
}


/**
 * Three reachability dots for DevHub's upstreams. Lives in the page header
 * — signals infra health separately from per-project health. Polls on a
 * slow cadence since every probe is a round-trip to UpdateSuite + DB.
 */
export default function SystemStatusStrip() {
  const { data } = useApi(
    () => getSystemStatus(),
    [],
    { intervalMs: 60_000 },
  )

  if (!data) {
    return (
      <div className="system-status-strip">
        <span className="label">system</span>
      </div>
    )
  }

  return (
    <div className="system-status-strip">
      <Check check={data.updatesuite} />
      <Check check={data.database} />
      <Check check={data.github} />
    </div>
  )
}
