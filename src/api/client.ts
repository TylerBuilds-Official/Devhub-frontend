/**
 * DevHub API client — thin fetch wrappers used by every resource module.
 *
 * BASE_URL resolves to /api in dev (Vite proxy strips the prefix and forwards
 * to DevHubAPI at :8766). In preview/prod, set VITE_API_URL to the deployed
 * DevHub API base URL.
 *
 * Every request goes out with a Bearer token acquired from MSAL. On 401
 * we retry once after forcing a fresh interactive token — covers cases
 * where the cached token has been revoked/rotated but MSAL hasn't caught up.
 */
import { acquireAccessToken } from '../auth/acquireToken'
import { emitSessionExpired } from '../auth/sessionBus'
import { msalInstance }       from '../auth/msalInstance'


const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`
  : '/api'


export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name   = 'ApiError'
    this.status = status
    this.detail = detail
  }
}


async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const token = await acquireAccessToken()
    return { Authorization: `Bearer ${token}` }
  }
  catch {
    // No signed-in account yet — let the call go out unauthenticated
    // and surface the 401 to the caller. This happens during the brief
    // window before AuthGate finishes its boot.
    return {}
  }
}


async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }))
    throw new ApiError(response.status, body.detail ?? response.statusText)
  }

  return response.json()
}


async function withAuthRetry<T>(run: (headers: Record<string, string>) => Promise<Response>): Promise<T> {
  let response = await run(await getAuthHeaders())

  if (response.status === 401) {
    // Token might be stale — force a silent reacquire and retry once.
    try {
      const fresh = await acquireAccessToken()
      response    = await run({ Authorization: `Bearer ${fresh}` })
    }
    catch {
      // Fall through — retry failed; session-expired path below handles it.
    }

    if (response.status === 401) {
      // The freshly-acquired token was also rejected. MSAL's cache is
      // out of sync with reality (token revoked, backend key rotation,
      // or the user was removed from UserRoles). Scrub MSAL state and
      // signal AuthGate to prompt a full re-auth.
      const account = msalInstance.getActiveAccount()
      if (account) {
        await msalInstance.clearCache({ account })
        msalInstance.setActiveAccount(null)
      }
      emitSessionExpired()
    }
  }

  return handleResponse<T>(response)
}


export async function get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    })
  }

  return withAuthRetry<T>(headers => fetch(url.toString(), { headers }))
}


export async function post<T>(path: string, body: FormData | Record<string, unknown>): Promise<T> {
  const isFormData = body instanceof FormData

  return withAuthRetry<T>(headers => fetch(`${BASE_URL}${path}`, {
    method:  'POST',
    headers: isFormData ? headers : { 'Content-Type': 'application/json', ...headers },
    body:    isFormData ? body : JSON.stringify(body),
  }))
}


export async function patch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return withAuthRetry<T>(headers => fetch(`${BASE_URL}${path}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body:    JSON.stringify(body),
  }))
}


export async function put<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return withAuthRetry<T>(headers => fetch(`${BASE_URL}${path}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body:    JSON.stringify(body),
  }))
}


export async function del_<T>(path: string): Promise<T> {
  return withAuthRetry<T>(headers => fetch(`${BASE_URL}${path}`, {
    method:  'DELETE',
    headers,
  }))
}
