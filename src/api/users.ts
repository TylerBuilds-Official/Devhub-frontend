/**
 * /users — admin-only CRUD against dev_hub.UserRoles.
 */
import { del_, get, patch, post } from './client'
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserRoleInfo,
  UserRolesResponse,
} from '../types/user'


export function listUsers(): Promise<UserRolesResponse> {
  return get<UserRolesResponse>('/users')
}


export function createUser(req: CreateUserRequest): Promise<UserRoleInfo> {
  return post<UserRoleInfo>('/users', req as unknown as Record<string, unknown>)
}


export function updateUser(email: string, req: UpdateUserRequest): Promise<UserRoleInfo> {
  return patch<UserRoleInfo>(`/users/${encodeURIComponent(email)}`, req as Record<string, unknown>)
}


export function deleteUser(email: string): Promise<void> {
  return del_<void>(`/users/${encodeURIComponent(email)}`)
}
