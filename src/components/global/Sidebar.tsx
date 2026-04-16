import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks } from 'lucide-react'


export default function Sidebar() {

  return (
    <nav className="app-sidebar">
      <div className="sidebar-brand">DevHub</div>

      <ul className="sidebar-nav">
        <li>
          <NavLink to="/" end>
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/jobs">
            <ListChecks size={16} />
            <span>Jobs</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
