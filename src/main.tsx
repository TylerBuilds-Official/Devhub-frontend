import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MsalProvider } from '@azure/msal-react'

import App from './App.tsx'
import AuthGate from './auth/AuthGate'
import ErrorBoundary from './components/global/ErrorBoundary'
import { ToastProvider } from './components/global/ToastProvider'
import { msalInstance } from './auth/msalInstance'

import './styles/global.css'
import './styles/layout.css'
import './styles/jobs.css'
import './styles/deploy-modal.css'
import './styles/job-detail.css'
import './styles/logs.css'
import './styles/auth.css'
import './styles/users.css'
import './styles/toast.css'
import './styles/error-boundary.css'
import './styles/skeleton.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <MsalProvider instance={msalInstance}>
        <ToastProvider>
          <AuthGate>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthGate>
        </ToastProvider>
      </MsalProvider>
    </ErrorBoundary>
  </StrictMode>,
)
