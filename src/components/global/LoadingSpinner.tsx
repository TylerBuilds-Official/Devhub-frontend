interface LoadingSpinnerProps {
  message?: string
}


export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {

  return (
    <div className="loading-spinner">
      <div className="spinner-ring" />
      <span>{message}</span>
    </div>
  )
}
