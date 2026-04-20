/**
 * /me — identity + role for the currently signed-in user.
 */
import { get }              from './client'
import type { MeResponse }  from '../types/me'


export function getMe(): Promise<MeResponse> {
  return get<MeResponse>('/me')
}
