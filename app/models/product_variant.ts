import mongoose, { Schema, Document } from 'mongoose'

export interface ProductVariantInterface extends Document {
  productId: mongoose.Types.ObjectId
  sku: string
  name: string
  price: number
  originalPrice?: number
  stock: number
  attributes: {
    attributeId: mongoose.Types.ObjectId
    attributeName: string
    value: string
  }[]
  images?: string[]
  isAvailable: boolean
  isDefault: boolean
  soldCount: number
  createdAt: Date
  updatedAt: Date
}

const ProductVariantSchema = new Schema<ProductVariantInterface>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0, index: true },
    originalPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0, index: true },
    attributes: [
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
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true, index: true },
    isDefault: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Compound indexes for fast filtering
ProductVariantSchema.index({ productId: 1, isAvailable: 1 })
ProductVariantSchema.index({ productId: 1, stock: 1 })
ProductVariantSchema.index({ price: 1, stock: 1 })
ProductVariantSchema.index({ 'attributes.attributeId': 1, 'attributes.value': 1 })

export const ProductVariant =
  mongoose.models.ProductVariant ||
  mongoose.model<ProductVariantInterface>('ProductVariant', ProductVariantSchema)
