import { get } from './client'
import type { ProjectInfo, ProjectsResponse } from '../types/project'


export async function getProjects(): Promise<ProjectsResponse> {

  return get<ProjectsResponse>('/projects')
}


export async function getProject(key: string): Promise<ProjectInfo> {

  return get<ProjectInfo>(`/projects/${key}`)
}
