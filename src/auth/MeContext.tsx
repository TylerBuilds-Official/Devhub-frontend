/**
 * MeContext — exposes the signed-in user's email / display name / role.
 *
 * Populated once by AuthGate after MSAL auth completes, then consumed
 * across the app for role-aware UI (hide deploy buttons for viewers,
 * render the header chip, etc.).
 */
import { createContext, useContext } from 'react'

import type { MeResponse } from '../types/me'


export const MeContext = createContext<MeResponse | null>(null)


export function useMe(): MeResponse {
  const me = useContext(MeContext)

  if (!me) {
    throw new Error('useMe() called outside of a signed-in context. Check <AuthGate>.')
  }

  return me
}


export function useIsAdmin(): boolean {
  const me = useContext(MeContext)
  return me?.role === 'admin'
}
