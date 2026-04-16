interface StatusBadgeProps {
  status: string | null
}


/**
 * Maps a health/job status string to a styled badge.
 * Unknown statuses render with the "unknown" class as a safe fallback.
 */
export default function StatusBadge({ status }: StatusBadgeProps) {
  const label = status ?? 'unknown'
  const cls   = label.toLowerCase().replace(/\s+/g, '-')

  return <span className={`status-badge status-${cls}`}>{label}</span>
}
