import { get } from './client'
import type { LogsResponse, LogStream } from '../types/log'


export async function getProjectLogs(
  projectKey: string,
  component:  string,
  stream:     LogStream,
  tail:       number = 200,
): Promise<LogsResponse> {

  return get<LogsResponse>(`/projects/${projectKey}/logs`, {
    component,
    stream,
    tail,
  })
}
