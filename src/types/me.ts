export type Role = 'viewer' | 'admin'


export interface MeResponse {
  email:        string
  display_name: string
  role:         Role
}
