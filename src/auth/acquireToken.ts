/**
 * Token acquisition for the API client.
 *
 * We send the ID token, not the Graph access token. Reason: Microsoft
 * Graph access tokens use a hashed-nonce signing scheme that standard
 * JWT libraries can't verify — Microsoft explicitly documents that
 * Graph access tokens "should not be inspected by the service for
 * which they were issued." ID tokens are standard JWTs signed with
 * the tenant's published JWKS and are the right tool when a backend
 * only needs identity (email + role lookup), not delegated Graph calls.
 *
 * Silent-first. If the silent path throws InteractionRequiredAuthError
 * (cache miss, revoked, consent needed), we kick off a full-page
 * redirect to AAD. The user comes back signed in, the app re-boots,
 * and the original fetch caller gets a 401 which the UI handles.
 *
 * We use redirect rather than popup because embedded-browser contexts
 * reject nested popups outright.
 */
import { InteractionRequiredAuthError } from '@azure/msal-browser'

import { loginRequest } from './msalConfig'
import { msalInstance } from './msalInstance'


export async function acquireAccessToken(): Promise<string> {
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0]

  if (!account) {
    throw new Error('No signed-in account; sign in before calling the API.')
  }

  try {
    const result = await msalInstance.acquireTokenSilent({ ...loginRequest, account })
    return result.idToken
  }
  catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      // Navigates away; the returned promise never resolves.
      await msalInstance.acquireTokenRedirect(loginRequest)
      throw err
    }
    throw err
  }
}
