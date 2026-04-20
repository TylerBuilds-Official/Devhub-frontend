import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks, Users } from 'lucide-react'

import { useIsAdmin } from '../../auth/MeContext'


export default function Sidebar() {
  const isAdmin = useIsAdmin()

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
        {isAdmin && (
          <li>
            <NavLink to="/users">
              <Users size={16} />
              <span>Users</span>
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  )
}
