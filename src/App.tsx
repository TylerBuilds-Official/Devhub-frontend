import { Routes, Route, Navigate } from 'react-router-dom'

import Sidebar            from './components/global/Sidebar'
import DashboardPage      from './pages/DashboardPage'
import JobsPage           from './pages/JobsPage'
import JobDetailPage      from './pages/JobDetailPage'


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
          <Route path="*"                         element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
