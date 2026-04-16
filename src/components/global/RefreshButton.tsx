import { RefreshCw } from 'lucide-react'


interface RefreshButtonProps {
  onClick:   () => void
  spinning?: boolean
  title?:    string
}


/**
 * Small icon button used in page headers to force-refresh the current view.
 * Spins while `spinning` is true — feed it the parent's `loading` state.
 */
export default function RefreshButton({ onClick, spinning = false, title = 'Refresh' }: RefreshButtonProps) {

  return (
    <button
      className={`refresh-button ${spinning ? 'is-spinning' : ''}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <RefreshCw size={14} />
    </button>
  )
}
