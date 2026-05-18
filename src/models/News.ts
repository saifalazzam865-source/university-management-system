/**
 * News / article model.
 *
 * `slug` is unique (implicit index). Status+publishedAt compound index
 * optimises the common "published news sorted by date" query.
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export type NewsCategory = 'research' | 'campus' | 'awards' | 'events' | 'academic' | 'general'
export type NewsStatus   = 'draft' | 'published' | 'archived'

export interface INewsDocument extends Document {
  title:       string
  slug:        string
  excerpt:     string
  content:     string
  category:    NewsCategory
  status:      NewsStatus
  coverImage:  string
  tags:        string[]
  author:      string
  publishedAt: Date | null
  views:       number
  featured:    boolean
  createdAt:   Date
  updatedAt:   Date
}

const NewsSchema = new Schema<INewsDocument>(
  {
    title:      { type: String, required: true, trim: true, maxlength: 500 },
    slug:       { type: String, required: true, unique: true, trim: true }, // implicit index
    excerpt:    { type: String, default: '', maxlength: 1000 },
    content:    { type: String, default: '' },
    category:   {
      type:    String,
      enum:    ['research','campus','awards','events','academic','general'],
      default: 'general',
    },
    status:     { type: String, enum: ['draft','published','archived'], default: 'draft' },
    coverImage: { type: String, default: '' },
    tags:       [{ type: String, trim: true, maxlength: 100 }],
    author:     { type: String, required: true, trim: true },
    publishedAt:{ type: Date, default: null },
    views:      { type: Number, default: 0, min: 0 },
    featured:   { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Compound index for the public "latest published" query
NewsSchema.index({ status: 1, publishedAt: -1 })
// Index for category filtering
NewsSchema.index({ category: 1, status: 1 })

export const NewsModel: Model<INewsDocument> =
  mongoose.models.News ??
  mongoose.model<INewsDocument>('News', NewsSchema)
