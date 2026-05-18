/**
 * User model — represents both students and admins.
 *
 * Passwords are hashed in the pre-save hook (bcrypt, 12 rounds).
 * The `password` field has `select: false` — never returned by default.
 *
 * Index notes:
 * - `email` and `studentId` are declared `unique` in the schema, which
 *   creates indexes automatically. We do NOT call UserSchema.index() for
 *   those same fields again to avoid Mongoose duplicate-index warnings.
 * - Only `role` needs a separate index() call since it has no schema-level
 *   `index` or `unique` option.
 */

import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

// ── TypeScript interface ───────────────────────────────────────────────────────

export interface IUserDocument extends Document {
  name:            string
  email:           string
  password:        string
  role:            'student' | 'admin'
  studentId?:      string
  faculty?:        string
  year?:           number
  gpa?:            number
  phone?:          string
  enrolledCourses: string[]
  isActive:        boolean
  createdAt:       Date
  updatedAt:       Date
  comparePassword(candidate: string): Promise<boolean>
}

// ── Schema ────────────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUserDocument>(
  {
    name:  { type: String, required: true, trim: true, maxlength: 150 },
    email: {
      type:      String,
      required:  true,
      unique:    true,           // ← implicit index; do NOT re-add below
      lowercase: true,
      trim:      true,
      maxlength: 254,
    },
    password: {
      type:      String,
      required:  true,
      select:    false,          // excluded from all queries by default
      minlength: 8,
    },
    role:      { type: String, enum: ['student', 'admin'], default: 'student', index: true },
    studentId: { type: String, unique: true, sparse: true, trim: true }, // sparse: nulls don't conflict
    faculty:   { type: String, trim: true },
    year:      { type: Number, min: 1, max: 6 },
    gpa:       { type: Number, min: 0, max: 4, default: 0 },
    phone:     { type: String, trim: true },
    enrolledCourses: [{ type: String }],
    isActive:  { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    // Suppress Mongoose 7 strictQuery warning
    strict: true,
  }
)

// ── Hooks ─────────────────────────────────────────────────────────────────────

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    this.password = await bcrypt.hash(this.password, 12)
    next()
  } catch (err) {
    next(err as Error)
  }
})

// ── Instance methods ──────────────────────────────────────────────────────────

UserSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

// ── Model ─────────────────────────────────────────────────────────────────────
// Guard against "Cannot overwrite model once compiled" errors in hot-reload

export const UserModel: Model<IUserDocument> =
  mongoose.models.User ??
  mongoose.model<IUserDocument>('User', UserSchema)
