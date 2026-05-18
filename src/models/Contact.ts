import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IContactDocument extends Document {
  name:      string
  email:     string
  subject:   string
  message:   string
  status:    'new' | 'read' | 'replied'
  createdAt: Date
  updatedAt: Date
}

const ContactSchema = new Schema<IContactDocument>(
  {
    name:    { type: String, required: true, trim: true, maxlength: 200 },
    email:   { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    subject: { type: String, required: true, trim: true, maxlength: 500 },
    message: { type: String, required: true, maxlength: 10000 },
    status:  { type: String, enum: ['new','read','replied'], default: 'new' },
  },
  { timestamps: true }
)

ContactSchema.index({ status: 1, createdAt: -1 })

export const ContactModel: Model<IContactDocument> =
  mongoose.models.Contact ??
  mongoose.model<IContactDocument>('Contact', ContactSchema)
