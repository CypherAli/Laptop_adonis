import mongoose, { Schema, Types, Document } from 'mongoose'

// Product Interface - Optimized with references
export interface ProductInterface extends Document {
  name: string
  description: string
  brandId: Types.ObjectId
  categoryId: Types.ObjectId
  basePrice: number
  images: string[]
  createdBy: Types.ObjectId
  features?: string[]
  warranty?: {
    duration?: string
    details?: string
  }
  rating?: {
    average?: number
    count?: number
  }
  specifications: {
    attributeId: Types.ObjectId
    attributeName: string
    value: string
  }[]
  isActive: boolean
  isFeatured: boolean
  soldCount: number
  viewCount: number
  slug?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  createdAt: Date
  updatedAt: Date
}

type ProductDocument = ProductInterface & Document

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    basePrice: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    features: [String],
    warranty: {
      duration: String,
      details: String,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    specifications: [
      {
        attributeId: {
          type: Schema.Types.ObjectId,
          ref: 'Attribute',
          required: true,
        },
        attributeName: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    soldCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    slug: { type: String, unique: true, sparse: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
  },
  { timestamps: true }
)

// Indexes for optimized queries
ProductSchema.index({ name: 'text', description: 'text' })
ProductSchema.index({ brandId: 1, categoryId: 1 })
ProductSchema.index({ soldCount: -1 })
ProductSchema.index({ createdAt: -1 })
ProductSchema.index({ isFeatured: 1, isActive: 1 })

// Auto-generate slug
ProductSchema.pre('save', async function () {
  if (this.isModified('name') && !this.slug) {
    this.slug =
      this.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      this._id.toString().slice(-6)
  }
})

export const Product = mongoose.model<ProductDocument>('Product', ProductSchema)
