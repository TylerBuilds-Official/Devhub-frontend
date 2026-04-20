/**
 * Singleton MSAL PublicClientApplication.
 *
 * Redirect flow, not popup — embedded-browser contexts (Claude Code,
 * Edge Copilot split, iframe) treat popup flows as nested popups and
 * refuse them outright. Redirect works everywhere.
 *
 * Exported separately from the React Provider so non-component code
 * (the API client, refresh flows) can acquire tokens without needing
 * to be inside a component tree.
 */
import { PublicClientApplication } from '@azure/msal-browser'

import { msalConfig } from './msalConfig'


export const msalInstance = new PublicClientApplication(msalConfig)

// Required by MSAL >= 3 before any other call.
await msalInstance.initialize()

// Finish any in-flight redirect (loginRedirect / acquireTokenRedirect).
// Returns null on a normal page load, an AuthenticationResult when
// returning from AAD. Either way, handleRedirectPromise() must be
// awaited once per app boot.
const redirectResult = await msalInstance.handleRedirectPromise()

if (redirectResult?.account) {
  msalInstance.setActiveAccount(redirectResult.account)
}
else {
  // Restore prior-session active account.
  const accounts = msalInstance.getAllAccounts()
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0])
  }
}
