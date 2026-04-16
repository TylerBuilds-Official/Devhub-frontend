import { get } from './client'
import type { UpstreamAppsResponse } from '../types/upstream'


export async function getUpstreamApps(): Promise<UpstreamAppsResponse> {

  return get<UpstreamAppsResponse>('/upstream/apps')
}
