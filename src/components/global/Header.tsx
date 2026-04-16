import type { ReactNode } from 'react'


interface HeaderProps {
  title:     string
  subtitle?: string
  children?: ReactNode
}


export default function Header({ title, subtitle, children }: HeaderProps) {

  return (
    <header className="app-header">
      <div className="app-header-titles">
        <h1>{title}</h1>
        {subtitle && <span className="app-header-subtitle">{subtitle}</span>}
      </div>

      {children && <div className="app-header-actions">{children}</div>}
    </header>
  )
}
