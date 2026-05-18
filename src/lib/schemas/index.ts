/**
 * Shared Zod validation schemas.
 *
 * Centralising schemas eliminates duplicate definitions spread across
 * multiple route files. Routes import the schema they need.
 */

import { z } from 'zod'
import {
  APPLICATION_STATUS,
  ALLOWED_REVIEW_STATUSES,
  NEWS_CATEGORIES,
  ANNOUNCEMENT_CATEGORIES,
  PROGRAMS,
  ENGLISH_LEVELS,
  GENDERS,
  CONTACT_STATUS,
} from '@/constants'

// ── Common field rules (reused across schemas) ────────────────────────────────

const emailField  = z.string().email('Invalid email address').toLowerCase().trim()
const nameField   = (label = 'Name') =>
  z.string().min(2, `${label} must be at least 2 characters`).max(150).trim()
const passwordField = z.string()
  .min(8,   'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// ── Auth ──────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name:     nameField('Name'),
  email:    emailField,
  password: passwordField,
  faculty:  z.string().min(1, 'Faculty is required'),
  phone:    z.string().max(30).optional(),
  year:     z.number().int().min(1).max(6).optional(),
})

// ── Application — step schemas ────────────────────────────────────────────────

export const ApplicationStep1Schema = z.object({
  firstName:   z.string().min(1, 'First name is required').max(100).trim(),
  lastName:    z.string().min(1, 'Last name is required').max(100).trim(),
  email:       emailField,
  phone:       z.string().min(7, 'Phone is required').max(30),
  dateOfBirth: z.string().optional(),
  nationality: z.string().max(100).optional(),
  address:     z.string().max(500).optional(),
  gender:      z.enum(GENDERS as [string, ...string[]]).optional(),
})

export const ApplicationStep2Schema = z.object({
  faculty:           z.string().min(1, 'Faculty is required'),
  program:           z.enum(PROGRAMS as [string, ...string[]]),
  specialization:    z.string().max(200).optional(),
  previousSchool:    z.string().max(300).optional(),
  graduationYear:    z.number().int().min(1980).max(2030).optional(),
  gpa:               z.number().min(0).max(4).optional(),
  englishLevel:      z.enum(ENGLISH_LEVELS as [string, ...string[]]).optional(),
  personalStatement: z.string().max(5000).optional(),
})

export const ApplicationStatusSchema = z.object({
  id:     z.string().min(1, 'id is required'),
  status: z.enum(ALLOWED_REVIEW_STATUSES as [string, ...string[]]),
  note:   z.string().max(2000).optional(),
})

// ── User ──────────────────────────────────────────────────────────────────────

export const CreateStudentSchema = z.object({
  name:     nameField(),
  email:    emailField,
  password: passwordField,
  faculty:  z.string().min(1, 'Faculty is required'),
  year:     z.number().int().min(1).max(6).optional(),
  gpa:      z.number().min(0).max(4).optional(),
  phone:    z.string().max(30).optional(),
})

export const UpdateStudentSchema = z.object({
  name:     nameField().optional(),
  faculty:  z.string().optional(),
  year:     z.number().int().min(1).max(6).optional(),
  gpa:      z.number().min(0).max(4).optional(),
  phone:    z.string().max(30).optional(),
  isActive: z.boolean().optional(),
})

export const UpdateProfileSchema = z.object({
  name:  nameField().optional(),
  phone: z.string().max(30).optional(),
})

// ── Faculty ───────────────────────────────────────────────────────────────────

export const FacultyCreateSchema = z.object({
  name:        z.string().min(2, 'Name is required').max(200).trim(),
  icon:        z.string().optional(),
  description: z.string().max(2000).optional(),
  dean:        z.string().max(150).optional(),
  email:       z.string().email().optional().or(z.literal('')),
  phone:       z.string().optional(),
  established: z.number().int().min(1800).max(2030).optional(),
  programs:    z.array(z.string().max(100)).max(50).optional(),
  isActive:    z.boolean().optional(),
  order:       z.number().int().min(0).optional(),
})

export const FacultyUpdateSchema = FacultyCreateSchema.partial()

// ── News ──────────────────────────────────────────────────────────────────────

export const NewsCreateSchema = z.object({
  title:    z.string().min(3, 'Title is required').max(500).trim(),
  excerpt:  z.string().max(1000).optional(),
  content:  z.string().max(50000).optional(),
  category: z.enum(NEWS_CATEGORIES as [string, ...string[]]).optional(),
  status:   z.enum(['draft', 'published', 'archived']).optional(),
  tags:     z.array(z.string().max(100)).max(20).optional(),
  featured: z.boolean().optional(),
})

export const NewsUpdateSchema = NewsCreateSchema.partial()

// ── Announcement ──────────────────────────────────────────────────────────────

export const AnnouncementCreateSchema = z.object({
  title:    z.string().min(3, 'Title is required').max(500).trim(),
  content:  z.string().min(10, 'Content is required').max(10000),
  category: z.enum(ANNOUNCEMENT_CATEGORIES as [string, ...string[]]),
})

// ── Contact ───────────────────────────────────────────────────────────────────

export const ContactCreateSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters').max(200).trim(),
  email:   emailField,
  subject: z.string().min(2, 'Subject is required').max(500).trim(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(10000),
})

export const ContactUpdateSchema = z.object({
  id:     z.string().min(1, 'id is required'),
  status: z.enum(['new', 'read', 'replied']),
})
