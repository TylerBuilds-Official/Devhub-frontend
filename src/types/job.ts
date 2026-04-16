export interface JobSummary {
  deploy_id:           string
  upstream_job_id:     string
  project_key:         string
  pipeline_key:        string
  status:              string
  current_step:        number
  total_steps:         number
  current_step_label:  string
  triggered_by:        string
  started_at:          string | null
  finished_at:         string | null
  error:               string | null
}


export interface JobDetail extends JobSummary {
  params: Record<string, unknown>
}


export interface JobsResponse {
  jobs: JobSummary[]
}


export interface JobLogResponse {
  deploy_id: string
  lines:     string[]
}
