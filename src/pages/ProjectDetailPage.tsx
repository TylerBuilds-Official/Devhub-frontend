import { useParams } from 'react-router-dom'

import Header     from '../components/global/Header'
import EmptyState  from '../components/global/EmptyState'


export default function ProjectDetailPage() {
  const { key } = useParams<{ key: string }>()

  return (
    <>
      <Header title={`Project · ${key ?? ''}`} subtitle="Deploy, health history, recent jobs" />

      <main className="page-content">
        <EmptyState
          title="Project detail coming soon"
          message="Deploy buttons, health history chart, and recent deploys land here."
        />
      </main>
    </>
  )
}
