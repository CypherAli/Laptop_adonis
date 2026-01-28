import mongoose, { Schema, Document } from 'mongoose'

export interface AttributeInterface extends Document {
  name: string
  slug: string
  type: 'select' | 'multiselect' | 'text' | 'number' | 'color'
  values: string[]
  categoryIds?: mongoose.Types.ObjectId[]
  isRequired: boolean
  isFilterable: boolean
  isVariant: boolean
  order: number
  unit?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AttributeSchema = new Schema<AttributeInterface>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ['select', 'multiselect', 'text', 'number', 'color'],
      default: 'select',
    },
    values: [{ type: String }],
    categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    isRequired: { type: Boolean, default: false },
    isFilterable: { type: Boolean, default: true, index: true },
    isVariant: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    unit: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

// Indexes
AttributeSchema.index({ isFilterable: 1, isActive: 1 })
AttributeSchema.index({ isVariant: 1 })

// Auto-generate slug
AttributeSchema.pre('save', function () {
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

export const Attribute =
  mongoose.models.Attribute || mongoose.model<AttributeInterface>('Attribute', AttributeSchema)
