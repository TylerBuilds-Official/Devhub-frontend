export interface DeployRequest {
  project_key:   string
  pipeline_key:  string
  params:        Record<string, unknown>
}


export interface DeployResponse {
  deploy_id:        string
  upstream_job_id:  string
  project_key:      string
  pipeline_key:     string
  status:           string
}
