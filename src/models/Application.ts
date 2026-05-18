/**
 * Application model — full admission application with multi-step data,
 * uploaded documents, status timeline, and auto-generated reference number.
 *
 * Index notes:
 * - `applicationRef` is declared `unique` in the schema (implicit index).
 * - `status`, `email` get explicit compound/single indexes below.
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

// ── Sub-document interfaces ───────────────────────────────────────────────────

export interface IUploadedDoc {
  label:        string
  fieldKey:     string
  originalName: string
  storedName:   string  // UUID filename stored on disk / cloud
  mimeType:     string
  sizeBytes:    number
  uploadedAt:   Date
}

export interface ITimelineEvent {
  status:    string
  note:      string
  changedBy: string
  changedAt: Date
}

// ── Main document interface ───────────────────────────────────────────────────

export interface IApplicationDocument extends Document {
  // Step 1 — Personal
  firstName:      string
  lastName:       string
  email:          string
  phone:          string
  dateOfBirth:    string
  nationality:    string
  address:        string
  gender:         'male' | 'female' | 'other' | 'prefer_not'

  // Step 2 — Academic
  faculty:           string
  program:           'undergraduate' | 'postgraduate'
  specialization:    string
  previousSchool:    string
  graduationYear:    number
  gpa:               number
  englishLevel:      'beginner' | 'intermediate' | 'advanced' | 'native'
  personalStatement: string

  // Step 3 — Uploaded documents
  documents:  IUploadedDoc[]

  // Admin review
  status:     'draft' | 'submitted' | 'reviewing' | 'accepted' | 'rejected'
  reviewNote: string
  reviewedBy: string
  timeline:   ITimelineEvent[]

  // Metadata
  applicationRef: string
  submittedAt:    Date
  createdAt:      Date
  updatedAt:      Date
}

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const UploadedDocSchema = new Schema<IUploadedDoc>({
  label:        { type: String, required: true },
  fieldKey:     { type: String, required: true },
  originalName: { type: String, required: true },
  storedName:   { type: String, required: true },
  mimeType:     { type: String, required: true },
  sizeBytes:    { type: Number, required: true, min: 0 },
  uploadedAt:   { type: Date,   default: Date.now },
}, { _id: false })

const TimelineSchema = new Schema<ITimelineEvent>({
  status:    { type: String, required: true },
  note:      { type: String, default: '' },
  changedBy: { type: String, required: true },
  changedAt: { type: Date,   default: Date.now },
}, { _id: false })

// ── Main schema ───────────────────────────────────────────────────────────────

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    email:       { type: String, required: true, lowercase: true, trim: true },
    phone:       { type: String, required: true },
    dateOfBirth: { type: String },
    nationality: { type: String },
    address:     { type: String },
    gender:      { type: String, enum: ['male', 'female', 'other', 'prefer_not'] },

    faculty:           { type: String, required: true },
    program:           { type: String, enum: ['undergraduate', 'postgraduate'], required: true },
    specialization:    { type: String },
    previousSchool:    { type: String },
    graduationYear:    { type: Number },
    gpa:               { type: Number, min: 0, max: 4 },
    englishLevel:      { type: String, enum: ['beginner', 'intermediate', 'advanced', 'native'] },
    personalStatement: { type: String, maxlength: 10000 },

    documents: { type: [UploadedDocSchema], default: [] },

    status:     { type: String, enum: ['draft','submitted','reviewing','accepted','rejected'], default: 'draft' },
    reviewNote: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    timeline:   { type: [TimelineSchema], default: [] },

    // unique: true creates an implicit index — do NOT add a separate .index() for applicationRef
    applicationRef: { type: String, unique: true, sparse: true },
    submittedAt:    { type: Date },
  },
  { timestamps: true }
)

// ── Auto-generate applicationRef on first save ────────────────────────────────

ApplicationSchema.pre('save', async function (next) {
  if (this.applicationRef) return next()

  try {
    const year  = new Date().getFullYear()
    // Use a random suffix to avoid race conditions in concurrent requests
    const rand  = Math.floor(Math.random() * 90000) + 10000
    this.applicationRef = `APP-${year}-${rand}`
    next()
  } catch (err) {
    next(err as Error)
  }
})

// ── Indexes ───────────────────────────────────────────────────────────────────
// Only non-unique, non-schema-declared indexes go here

ApplicationSchema.index({ status: 1, submittedAt: -1 })   // list queries
ApplicationSchema.index({ email: 1 })                      // lookup by applicant

// ── Model guard ───────────────────────────────────────────────────────────────

export const ApplicationModel: Model<IApplicationDocument> =
  mongoose.models.Application ??
  mongoose.model<IApplicationDocument>('Application', ApplicationSchema)
