export interface ProjectHealth {
  status:       string
  latency_ms:   number | null
  status_code:  number | null
  checked_at:   string | null
  error:        string | null
}


export interface ProjectInfo {
  key:              string
  display_name:     string
  description:      string
  category:         string
  repo:             string | null
  health_url:       string | null
  verify_tls:       boolean
  updatesuite_app:  string | null
  tags:             string[]
  docs_paths:       string[]
  health:           ProjectHealth | null
}


export interface ProjectsResponse {
  projects: ProjectInfo[]
}
