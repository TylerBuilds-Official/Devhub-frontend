/**
 * Top-level error boundary.
 *
 * Catches render-time exceptions anywhere in the subtree and shows a
 * minimal "something broke" card instead of a white page. Logs the
 * error to the console so devtools pick it up.
 *
 * Class component because React error boundaries require the
 * componentDidCatch lifecycle — there's no hook equivalent yet.
 */
import { Component, type ReactNode } from 'react'
import { RefreshCcw }                from 'lucide-react'


interface Props {
  children: ReactNode
}


interface State {
  error: Error | null
}


export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }


  static getDerivedStateFromError(error: Error): State {
    return { error }
  }


  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }


  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <div className="error-boundary">
        <div className="error-boundary-card">
          <h1>Something broke</h1>
          <p className="error-boundary-subtitle">
            DevHub hit an unexpected error. Reloading usually clears it.
          </p>

          <pre className="error-boundary-detail">{this.state.error.message}</pre>

          <button className="btn-primary error-boundary-button" onClick={() => window.location.reload()}>
            <RefreshCcw size={14} />
            Reload
          </button>
        </div>
      </div>
    )
  }
}
