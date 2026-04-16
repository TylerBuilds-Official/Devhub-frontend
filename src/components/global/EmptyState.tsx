import type { ReactNode } from 'react'


interface EmptyStateProps {
  title:     string
  message?:  string
  children?: ReactNode
}


export default function EmptyState({ title, message, children }: EmptyStateProps) {

  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children}
    </div>
  )
}
