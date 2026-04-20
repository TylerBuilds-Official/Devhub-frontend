/**
 * AuthGate — blocks rendering until the user is signed in AND has a
 * resolved role on the backend.
 *
 * States:
 *   - no MSAL account                → <SignInScreen>
 *   - account but /me not yet loaded → loading spinner
 *   - /me returned 403 (unknown user) → unauthorized screen
 *   - /me returned ok                 → render children inside MeContext
 */
import { useEffect, useState, type ReactNode } from 'react'
import { useIsAuthenticated, useMsal }         from '@azure/msal-react'

import { ApiError }        from '../api/client'
import { getMe }           from '../api/me'
import { loginRequest }    from './msalConfig'
import { MeContext }       from './MeContext'
import { onSessionExpired } from './sessionBus'
import SignInScreen        from './SignInScreen'
import type { MeResponse } from '../types/me'


interface AuthGateProps {
  children: ReactNode
}


export default function AuthGate({ children }: AuthGateProps) {
  const isAuthed     = useIsAuthenticated()
  const { instance } = useMsal()

  const [me, setMe]                       = useState<MeResponse | null>(null)
  const [loading, setLoading]             = useState<boolean>(false)
  const [error, setError]                 = useState<ApiError | null>(null)
  const [sessionExpired, setSessionExpired] = useState<boolean>(false)

  // Listen for mid-session 401s from the API client.
  useEffect(() => {
    return onSessionExpired(() => {
      setMe(null)
      setError(null)
      setSessionExpired(true)
    })
  }, [])

  useEffect(() => {
    if (!isAuthed || sessionExpired) {
      if (!isAuthed) setMe(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getMe()
      .then(data => {
        if (!cancelled) setMe(data)
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof ApiError ? err : new ApiError(0, String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [isAuthed, sessionExpired])

  function handleReauth() {
    setSessionExpired(false)
    instance.loginRedirect(loginRequest).catch(() => {
      // Redirect navigated away; this promise never resolves in the current page.
    })
  }

  if (sessionExpired) {
    return (
      <div className="signin-screen">
        <div className="signin-card">
          <h1>Session expired</h1>
          <p className="signin-subtitle">Your sign-in has expired. Sign in again to continue.</p>

          <button className="btn-primary signin-button" onClick={handleReauth}>
            Sign in with Microsoft
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    return <SignInScreen />
  }

  if (loading || (!me && !error)) {
    return (
      <div className="signin-screen">
        <div className="loading-spinner">
          <span className="spinner-ring" />
          Authorizing
        </div>
      </div>
    )
  }

  if (error) {
    const isForbidden = error.status === 403

    return (
      <div className="signin-screen">
        <div className="signin-card">
          <h1>{isForbidden ? 'Not authorized' : 'Auth error'}</h1>
          <p className="signin-subtitle">
            {isForbidden
              ? 'Your account is not on the DevHub allowlist. Contact an admin to get access.'
              : error.detail}
          </p>

          <button
            className="btn-secondary signin-button"
            onClick={() => instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin })}
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return <MeContext.Provider value={me}>{children}</MeContext.Provider>
}
