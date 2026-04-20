/**
 * MSAL configuration for DevHub.
 *
 * Reuses the JobScan app registration — public client, Graph audience
 * tokens, no custom API scope. We only need identity; the backend
 * resolves RBAC from the email claim against dev_hub.UserRoles.
 *
 * Cache is sessionStorage so tokens don't survive a browser close —
 * trade-off for not persisting bearer tokens to disk. Flip to
 * localStorage if re-signing on every new tab gets annoying.
 */
import type { Configuration, RedirectRequest } from '@azure/msal-browser'


const TENANT_ID = import.meta.env.VITE_AAD_TENANT_ID as string
const CLIENT_ID = import.meta.env.VITE_AAD_CLIENT_ID as string

if (!TENANT_ID || !CLIENT_ID) {
  throw new Error(
    'Missing VITE_AAD_TENANT_ID / VITE_AAD_CLIENT_ID — copy .env.example to .env.local and fill them in.',
  )
}


export const msalConfig: Configuration = {
  auth: {
    clientId:              CLIENT_ID,
    authority:             `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri:           `${window.location.origin}/auth/callback`,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
}


export const loginRequest: RedirectRequest = {
  scopes: ['User.Read'],
}
