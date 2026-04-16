import { post } from './client'
import type { DeployRequest, DeployResponse } from '../types/deploy'


export async function triggerDeploy(payload: DeployRequest): Promise<DeployResponse> {

  return post<DeployResponse>('/deploys', payload as unknown as Record<string, unknown>)
}
