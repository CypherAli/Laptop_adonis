import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ReviewDocument extends Document {
  product: Types.ObjectId
  user: Types.ObjectId
  order?: Types.ObjectId
  rating: number
  title: string
  comment: string
  images?: string[]
  isVerifiedPurchase: boolean
  helpfulCount: number
  helpfulBy?: Types.ObjectId[]
  pros?: string[]
  cons?: string[]
  isApproved: boolean
  moderatedBy?: Types.ObjectId
  moderatedAt?: Date
  sellerResponse?: {
    comment?: string
    respondedBy?: Types.ObjectId
    respondedAt?: Date
  }
  createdAt?: Date
  updatedAt?: Date
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    images: [String],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    pros: [String],
    cons: [String],
    isApproved: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    moderatedAt: Date,
    sellerResponse: {
      comment: String,
      respondedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedAt: Date,
    },
  },
  { timestamps: true }
)

// Compound index to ensure one review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true })
ReviewSchema.index({ createdAt: -1 })
ReviewSchema.index({ rating: -1 })
ReviewSchema.index({ isApproved: 1, createdAt: -1 })

// Update product rating after review is saved
ReviewSchema.post('save', async function () {
  if (this.isApproved) {
    const Product = mongoose.model('Product')
    const product = await Product.findById(this.product)
    if (product && typeof product.updateRating === 'function') {
      await product.updateRating()
    }
  }
})

export const Review =
  mongoose.models.Review || mongoose.model<ReviewDocument>('Review', ReviewSchema)
