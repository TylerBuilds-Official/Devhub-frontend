export type LogStream = 'stdout' | 'stderr'


export interface LogsResponse {
  project_key: string
  component:   string
  stream:      LogStream
  path:        string
  lines:       string[]
  missing:     boolean
}
