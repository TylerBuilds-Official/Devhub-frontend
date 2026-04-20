import { Routes, Route, Navigate } from 'react-router-dom'

import Sidebar            from './components/global/Sidebar'
import { useIsAdmin }     from './auth/MeContext'
import DashboardPage      from './pages/DashboardPage'
import JobsPage           from './pages/JobsPage'
import JobDetailPage      from './pages/JobDetailPage'
import UsersPage          from './pages/UsersPage'


function AdminOnly({ element }: { element: React.ReactElement }) {
  return useIsAdmin() ? element : <Navigate to="/" replace />
}


export default function App() {

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Routes>
          <Route path="/"                         element={<DashboardPage />} />
          <Route path="/projects/:projectKey"     element={<DashboardPage />} />
          <Route path="/jobs"                     element={<JobsPage />} />
          <Route path="/jobs/:id"                 element={<JobDetailPage />} />
          <Route path="/users"                    element={<AdminOnly element={<UsersPage />} />} />
          <Route path="*"                         element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
