/**
 * Types mirroring UpdateSuiteAPI's /apps response, which DevHub proxies
 * through /api/upstream/apps.
 */

export interface StepInfo {
  name:   string
  label:  string
}


export interface ParamInfo {
  name:         string
  type:         string
  required:     boolean
  label:        string
  placeholder?: string | null
  default?:     string | boolean | number | null
}


export interface PipelineInfo {
  key:           string
  display_name:  string
  description:   string
  est_seconds:   number
  params:        ParamInfo[]
  steps:         StepInfo[]
}


export interface UpstreamAppInfo {
  key:           string
  display_name:  string
  pipelines:     PipelineInfo[]
}


export interface UpstreamAppsResponse {
  apps: UpstreamAppInfo[]
}
