/**
 * UserService — all user-related business logic.
 *
 * API routes call these functions; they never query MongoDB directly.
 * All RBAC checks happen here so the permission enforcement is centralised.
 */

import type { FilterQuery } from 'mongoose'
import { UserModel, type IUserDocument } from '@/models/User'
import { generateStudentId }              from '@/lib/utils'
import { assertPermission, type UserRole } from '@/lib/rbac'
import { NotFoundError, ConflictError, PermissionError } from '@/lib/errors'
import { logger }                          from '@/lib/logger'
import { PAGINATION_CONFIG }               from '@/config/app.config'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ListUsersFilter {
  role?:     string
  faculty?:  string
  search?:   string
  isActive?: boolean
  page?:     number
  limit?:    number
}

export interface CreateStudentData {
  name:     string
  email:    string
  password: string
  faculty:  string
  year?:    number
  gpa?:     number
  phone?:   string
}

export interface UpdateUserPatch {
  name?:     string
  faculty?:  string
  year?:     number
  gpa?:      number
  phone?:    string
  isActive?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safePaginate(page?: number, limit?: number) {
  return {
    page:  Math.max(1, page ?? PAGINATION_CONFIG.defaultPage),
    limit: Math.min(Math.max(1, limit ?? PAGINATION_CONFIG.defaultLimit), PAGINATION_CONFIG.maxLimit),
  }
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getUserById(
  requesterId: string,
  requesterRole: UserRole,
  targetId: string
) {
  if (requesterRole === 'student' && requesterId !== targetId) {
    assertPermission(requesterRole, 'user:read:any')
  } else {
    assertPermission(requesterRole, 'user:read:own')
  }

  const query = requesterRole === 'student'
    ? { _id: targetId, isActive: true }
    : { _id: targetId }

  return UserModel.findOne(query).select('-password').lean()
}

export async function listUsers(requesterRole: UserRole, filters: ListUsersFilter) {
  assertPermission(requesterRole, 'user:read:any')

  const { role = 'student', faculty, search, isActive } = filters
  const { page, limit } = safePaginate(filters.page, filters.limit)

  const query: FilterQuery<IUserDocument> = { role }
  if (faculty)              query.faculty  = faculty
  if (isActive !== undefined) query.isActive = isActive
  if (search) {
    query.$or = [
      { name:      { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
    ]
  }

  const [users, total] = await Promise.all([
    UserModel
      .find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(query),
  ])

  return { users, total, page, limit }
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createStudent(
  requesterRole: UserRole,
  data: CreateStudentData,
) {
  assertPermission(requesterRole, 'user:create')

  const email    = data.email.toLowerCase().trim()
  const existing = await UserModel.findOne({ email })
  if (existing) throw new ConflictError('Email already registered')

  const user = await UserModel.create({
    name:      data.name.trim(),
    email,
    password:  data.password,          // hashed by pre-save hook
    role:      'student' as const,     // enforced — never taken from input
    studentId: generateStudentId(),
    faculty:   data.faculty,
    year:      data.year  ?? 1,
    gpa:       data.gpa   ?? 0,
    phone:     data.phone?.trim(),
    isActive:  true,
  })

  logger.info('Student account created', { context: 'user', meta: { studentId: user.studentId } })
  return { id: user._id.toString(), studentId: user.studentId }
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateUser(
  requesterId: string,
  requesterRole: UserRole,
  targetId: string,
  patch: UpdateUserPatch,
) {
  if (requesterRole === 'student') {
    if (requesterId !== targetId) assertPermission(requesterRole, 'user:update:any') // throws
    // Strip privilege-escalation fields
    delete patch.gpa
    delete patch.isActive
  } else {
    assertPermission(requesterRole, 'user:update:any')
  }

  const user = await UserModel
    .findByIdAndUpdate(targetId, patch, { new: true, runValidators: true })
    .select('-password')
    .lean()

  if (!user) throw new NotFoundError('User')
  return user
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteUser(requesterRole: UserRole, targetId: string) {
  assertPermission(requesterRole, 'user:delete:any')

  const user = await UserModel.findById(targetId)
  if (!user) throw new NotFoundError('User')
  if (user.role === 'admin') throw new PermissionError('Admin accounts cannot be deleted via the API')

  await UserModel.findByIdAndDelete(targetId)
  logger.warn('User account deleted', { context: 'user', meta: { targetId, role: user.role } })
  return { deleted: true, id: targetId }
}

// ── Register (public) ─────────────────────────────────────────────────────────

export async function registerStudent(data: {
  name:     string
  email:    string
  password: string
  faculty:  string
  phone?:   string
  year?:    number
}) {
  const email    = data.email.toLowerCase().trim()
  const existing = await UserModel.findOne({ email })
  if (existing) throw new ConflictError('An account with this email already exists')

  const user = await UserModel.create({
    name:      data.name.trim(),
    email,
    password:  data.password,
    role:      'student' as const,  // hardcoded — public registration always = student
    studentId: generateStudentId(),
    faculty:   data.faculty,
    phone:     data.phone?.trim(),
    year:      data.year ?? 1,
    isActive:  true,
  })

  logger.info('New student registered', {
    context: 'auth',
    meta: { studentId: user.studentId, faculty: user.faculty },
  })

  return {
    id:        user._id.toString(),
    name:      user.name,
    email:     user.email,
    studentId: user.studentId,
    faculty:   user.faculty,
  }
}
