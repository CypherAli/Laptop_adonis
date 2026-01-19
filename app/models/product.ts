import mongoose, { Schema, Types, Document } from 'mongoose'

// Interface for Product Variant (Shoe-specific)
export interface ProductVariant {
  variantName: string // e.g., "Size 42 - Black"
  sku: string
  price: number
  originalPrice?: number
  stock: number
  specifications: {
    size?: string // Shoe size: 35, 36, 37...45
    color?: string // Color: Black, White, Red...
    material?: string // Material: Leather, Canvas, Mesh...
    shoeType?: string // Type: Running, Casual, Formal, Sports
    gender?: string // Gender: Nam, Nữ, Unisex
  }
  isAvailable: boolean
}

// Product Interface
export interface ProductInterface extends Document {
  name: string
  description: string
  brand: string
  category: string
  basePrice: number
  variants: ProductVariant[]
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
  isActive: boolean
  isFeatured: boolean
  soldCount: number
  viewCount: number
  slug?: string
  createdAt: Date
  updatedAt: Date
}

type ProductDocument = ProductInterface & Document

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    brand: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    basePrice: { type: Number, required: true, min: 0 },
    variants: [
      {
        variantName: { type: String, required: true },
        sku: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        originalPrice: { type: Number, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        specifications: {
          size: String, // Shoe size
          color: String, // Color
          material: String, // Material
          shoeType: String, // Type: Running, Casual, etc.
          gender: String, // Gender: Nam, Nữ, Unisex
        },
        isAvailable: { type: Boolean, default: true },
      },
    ],
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
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    slug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
)

// Indexes
ProductSchema.index({ name: 'text', description: 'text' })
ProductSchema.index({ 'variants.price': 1 })
ProductSchema.index({ soldCount: -1 })
ProductSchema.index({ createdAt: -1 })

// Auto-generate slug
ProductSchema.pre('save', async function () {
  if (this.isModified('name') && !this.slug) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      this._id.toString().slice(-6)
  }
})

export const Product = mongoose.model<ProductDocument>('Product', ProductSchema)
