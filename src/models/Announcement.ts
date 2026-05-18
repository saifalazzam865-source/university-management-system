import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAnnouncementDocument extends Document {
  title:     string
  content:   string
  category:  'academic' | 'general' | 'event' | 'urgent'
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const AnnouncementSchema = new Schema<IAnnouncementDocument>(
  {
    title:     { type: String, required: true, trim: true, maxlength: 500 },
    content:   { type: String, required: true, maxlength: 10000 },
    category:  { type: String, enum: ['academic','general','event','urgent'], default: 'general' },
    createdBy: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

AnnouncementSchema.index({ createdAt: -1 })

export const AnnouncementModel: Model<IAnnouncementDocument> =
  mongoose.models.Announcement ??
  mongoose.model<IAnnouncementDocument>('Announcement', AnnouncementSchema)
