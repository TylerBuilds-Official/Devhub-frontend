import { get } from './client'
import type { JobDetail, JobLogResponse, JobsResponse } from '../types/job'


export async function getJobs(limit = 50, projectKey?: string): Promise<JobsResponse> {
  const params: Record<string, string | number> = { limit }
  if (projectKey) params.project_key = projectKey

  return get<JobsResponse>('/jobs', params)
}


export async function getJob(deployId: string): Promise<JobDetail> {

  return get<JobDetail>(`/jobs/${deployId}`)
}


export async function getJobLog(deployId: string): Promise<JobLogResponse> {

  return get<JobLogResponse>(`/jobs/${deployId}/log`)
}
