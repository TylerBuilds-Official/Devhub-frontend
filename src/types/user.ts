import type { Role } from './me'


export interface UserRoleInfo {
  email:       string
  role:        Role
  created_at:  string
  created_by:  string | null
  notes:       string | null
}


export interface UserRolesResponse {
  users: UserRoleInfo[]
}


export interface CreateUserRequest {
  email: string
  role:  Role
  notes?: string | null
}


export interface UpdateUserRequest {
  role?:  Role
  notes?: string | null
}
