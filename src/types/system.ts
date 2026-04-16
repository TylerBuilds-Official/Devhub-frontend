export interface UpstreamCheck {
  name:        string
  status:      string
  latency_ms:  number | null
  checked_at:  string
  error:       string | null
}


export interface SystemStatus {
  updatesuite:  UpstreamCheck
  database:     UpstreamCheck
  github:       UpstreamCheck
}
