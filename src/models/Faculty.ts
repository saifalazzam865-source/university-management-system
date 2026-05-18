/**
 * Faculty model — academic departments/faculties.
 *
 * `slug` is unique (implicit index from schema).
 * Separate indexes cover the most common query patterns.
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IFacultyDocument extends Document {
  name:         string
  slug:         string
  icon:         string
  description:  string
  dean:         string
  email:        string
  phone:        string
  established:  number
  programs:     string[]
  isActive:     boolean
  order:        number
  createdAt:    Date
  updatedAt:    Date
}

const FacultySchema = new Schema<IFacultyDocument>(
  {
    name:        { type: String, required: true, trim: true, maxlength: 200 },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon:        { type: String, default: '🏛', trim: true },
    description: { type: String, default: '', maxlength: 2000 },
    dean:        { type: String, default: '', trim: true },
    email:       { type: String, default: '', lowercase: true, trim: true },
    phone:       { type: String, default: '', trim: true },
    established: { type: Number, min: 1800, max: new Date().getFullYear() + 10 },
    programs:    [{ type: String, trim: true }],
    isActive:    { type: Boolean, default: true },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Compound index for the common "active faculties sorted by order" query
FacultySchema.index({ isActive: 1, order: 1 })

export const FacultyModel: Model<IFacultyDocument> =
  mongoose.models.Faculty ??
  mongoose.model<IFacultyDocument>('Faculty', FacultySchema)
