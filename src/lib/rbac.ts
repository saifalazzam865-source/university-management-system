/**
 * Role-Based Access Control (RBAC).
 *
 * Single source of truth for all permissions. Errors re-exported from
 * lib/errors so the rest of the codebase only needs one import path.
 */

import { PermissionError, AuthError } from './errors'
export { PermissionError, AuthError } from './errors'

export type UserRole   = 'admin' | 'student'

export type Permission =
  | 'application:create'
  | 'application:read:own'
  | 'application:read:any'
  | 'application:update:status'
  | 'user:read:own'
  | 'user:read:any'
  | 'user:update:own'
  | 'user:update:any'
  | 'user:delete:any'
  | 'user:create'
  | 'announcement:read'
  | 'announcement:create'
  | 'announcement:delete'
  | 'news:read:published'
  | 'news:read:any'
  | 'news:write'
  | 'news:delete'
  | 'faculty:read'
  | 'faculty:write'
  | 'faculty:delete'
  | 'contact:create'
  | 'contact:read'
  | 'contact:update'

const PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  admin: new Set([
    'application:create', 'application:read:own', 'application:read:any', 'application:update:status',
    'user:read:own', 'user:read:any', 'user:update:own', 'user:update:any', 'user:delete:any', 'user:create',
    'announcement:read', 'announcement:create', 'announcement:delete',
    'news:read:published', 'news:read:any', 'news:write', 'news:delete',
    'faculty:read', 'faculty:write', 'faculty:delete',
    'contact:create', 'contact:read', 'contact:update',
  ]),
  student: new Set([
    'application:create', 'application:read:own',
    'user:read:own', 'user:update:own',
    'announcement:read', 'news:read:published', 'faculty:read', 'contact:create',
  ]),
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSIONS[role]?.has(permission) ?? false
}

export function assertPermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new PermissionError(`Role '${role}' does not have permission '${permission}'`)
  }
}
