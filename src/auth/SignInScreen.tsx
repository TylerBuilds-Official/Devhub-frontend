/**
 * Sign-in gate. Rendered when there's no MSAL account.
 *
 * Industrial dark, matches the rest of the app. Single CTA — sign in
 * with Microsoft via redirect flow (popup is blocked in embedded
 * browser contexts — see acquireToken.ts / msalInstance.ts).
 */
import { useState }                         from 'react'
import { useMsal }                          from '@azure/msal-react'

import { loginRequest }                     from './msalConfig'


export default function SignInScreen() {
  const { instance }             = useMsal()
  const [busy, setBusy]          = useState(false)
  const [error, setError]        = useState<string | null>(null)

  async function handleSignIn() {
    setError(null)
    setBusy(true)
    try {
      // Navigates away; the promise never resolves in the current page.
      // MSAL picks up the return trip in msalInstance.ts via
      // handleRedirectPromise().
      await instance.loginRedirect(loginRequest)
    }
    catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <div className="signin-screen">
      <div className="signin-card">
        <h1>DevHub</h1>
        <p className="signin-subtitle">MFC deployment console</p>

        <button
          className="btn-primary signin-button"
          onClick={handleSignIn}
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Sign in with Microsoft'}
        </button>

        {error && (
          <div className="signin-error">
            <span className="label">Sign-in failed</span>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
