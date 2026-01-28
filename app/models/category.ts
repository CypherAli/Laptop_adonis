import mongoose, { Schema, Document } from 'mongoose'

export interface CategoryInterface extends Document {
  name: string
  slug: string
  description?: string
  parentId?: mongoose.Types.ObjectId
  level: number
  image?: string
  isActive: boolean
  order: number
  metaTitle?: string
  metaDescription?: string
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<CategoryInterface>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    level: { type: Number, default: 0 },
    image: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
)

// Indexes
CategorySchema.index({ parentId: 1, order: 1 })
CategorySchema.index({ slug: 1 })

// Auto-generate slug
CategorySchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
})

export const Category =
  mongoose.models.Category || mongoose.model<CategoryInterface>('Category', CategorySchema)
