import { get } from './client'
import type { SystemStatus } from '../types/system'


export async function getSystemStatus(): Promise<SystemStatus> {

  return get<SystemStatus>('/system/status')
}
