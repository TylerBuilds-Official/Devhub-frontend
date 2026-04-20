export interface ProjectHealth {
  status:       string
  latency_ms:   number | null
  status_code:  number | null
  checked_at:   string | null
  error:        string | null
}


export interface ProjectLogs {
  // { component: { stdout: path, stderr: path } }
  [component: string]: {
    stdout?: string
    stderr?: string
  }
}


export interface ProjectInfo {
  key:               string
  display_name:      string
  description:       string
  category:          string
  repo:              string | null
  health_url:        string | null
  health_interval_s: number | null
  verify_tls:        boolean
  updatesuite_app:   string | null
  tags:              string[]
  docs_paths:        string[]
  logs:              ProjectLogs | null
  health:            ProjectHealth | null
  last_deploy_at:    string | null
}


export interface ProjectsResponse {
  projects: ProjectInfo[]
}
