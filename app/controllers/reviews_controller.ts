import type { HttpContext } from '@adonisjs/core/http'
import mongoose from 'mongoose'
import { Review } from '#models/review'
import { Product } from '#models/product'
import { Order } from '#models/order'

export default class ReviewsController {
  /**
   * Get all reviews with pagination (for admin)
   */
  async index({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, isApproved } = request.qs()

      const filter: any = {}
      if (isApproved !== undefined) {
        filter.isApproved = isApproved === 'true'
      }

      const pageNum = Number(page)
      const limitNum = Number(limit)
      const skip = (pageNum - 1) * limitNum

      const [reviews, total] = await Promise.all([
        Review.find(filter)
          .populate('user', 'username email')
          .populate('product', 'name imageUrl')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Review.countDocuments(filter),
      ])

      return response.json({
        reviews,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalReviews: total,
      })
    } catch (error) {
      console.error('Get reviews error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get reviews for a product
   */
  async getByProduct({ params, request, response }: HttpContext) {
    try {
      const { productId } = params
      const { page = 1, limit = 10, rating, sortBy = 'recent' } = request.qs()

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return response.status(400).json({
          message: 'ID sản phẩm không hợp lệ',
        })
      }

      const filter: any = { product: productId, isApproved: true }

      if (rating) {
        filter.rating = Number(rating)
      }

      // Sort options
      const sort: any = {}
      if (sortBy === 'recent') {
        sort.createdAt = -1
      } else if (sortBy === 'helpful') {
        sort.helpfulCount = -1
      } else if (sortBy === 'rating_high') {
        sort.rating = -1
      } else if (sortBy === 'rating_low') {
        sort.rating = 1
      }

      const pageNum = Number(page)
      const limitNum = Number(limit)
      const skip = (pageNum - 1) * limitNum

      const [reviews, total] = await Promise.all([
        Review.find(filter)
          .populate('user', 'username avatar')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Review.countDocuments(filter),
      ])

      return response.json({
        reviews,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalReviews: total,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Create a new review
   */
  async create({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { productId, orderId, rating, title, comment, images, pros, cons } = request.only([
        'productId',
        'orderId',
        'rating',
        'title',
        'comment',
        'images',
        'pros',
        'cons',
      ])

      // Validation
      if (!productId || !rating || !title || !comment) {
        return response.status(400).json({
          message: 'Product ID, rating, title và comment là bắt buộc',
        })
      }

      if (rating < 1 || rating > 5) {
        return response.status(400).json({
          message: 'Rating phải từ 1 đến 5',
        })
      }

      // Validate productId format
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return response.status(400).json({
          message: 'ID sản phẩm không hợp lệ',
        })
      }

      // Check if product exists
      const product = await Product.findById(productId)
      if (!product) {
        console.error('Product not found for ID:', productId)
        return response.status(404).json({
          message: 'Không tìm thấy sản phẩm',
        })
      }

      // Check if user already reviewed this product
      const existingReview = await Review.findOne({ product: productId, user: userId })
      if (existingReview) {
        return response.status(400).json({
          message: 'Bạn đã đánh giá sản phẩm này rồi',
        })
      }

      // Check if user purchased this product - REQUIRED for review
      let confirmedOrder
      if (orderId) {
        // If orderId is provided, use it
        confirmedOrder = await Order.findOne({
          '_id': orderId,
          'user': userId,
          'items.product': productId,
          'status': { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
        })
      } else {
        // Otherwise find any confirmed order with this product
        confirmedOrder = await Order.findOne({
          'user': userId,
          'items.product': productId,
          'status': { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
        })
      }

      if (!confirmedOrder) {
        return response.status(403).json({
          message: 'Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã được xác nhận',
        })
      }

      // Create review
      const review = new Review({
        product: productId,
        user: userId,
        order: confirmedOrder._id,
        rating,
        title,
        comment,
        images: images || [],
        pros: pros || [],
        cons: cons || [],
        isVerifiedPurchase: true, // Always true since we check above
        isApproved: true, // Auto-approve for now, can add moderation later
      })

      await review.save()

      // Update product rating
      await this.updateProductRating(productId)

      // Populate user info
      const populatedReview = await Review.findById(review._id)
        .populate('user', 'username avatar')
        .lean()

      return response.status(201).json({
        message: 'Đánh giá thành công',
        review: populatedReview,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Update a review
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { id } = params
      const { rating, title, comment, images, pros, cons } = request.only([
        'rating',
        'title',
        'comment',
        'images',
        'pros',
        'cons',
      ])

      const review = await Review.findById(id)

      if (!review) {
        return response.status(404).json({
          message: 'Không tìm thấy đánh giá',
        })
      }

      // Check ownership
      if (review.user.toString() !== userId) {
        return response.status(403).json({
          message: 'Bạn không có quyền cập nhật đánh giá này',
        })
      }

      // Update fields
      if (rating) {
        if (rating < 1 || rating > 5) {
          return response.status(400).json({
            message: 'Rating phải từ 1 đến 5',
          })
        }
        review.rating = rating
      }
      if (title) review.title = title
      if (comment) review.comment = comment
      if (images) review.images = images
      if (pros) review.pros = pros
      if (cons) review.cons = cons

      await review.save()

      // Update product rating
      await this.updateProductRating(review.product)

      const updatedReview = await Review.findById(review._id)
        .populate('user', 'username avatar')
        .lean()

      return response.json({
        message: 'Cập nhật đánh giá thành công',
        review: updatedReview,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Delete a review
   */
  async destroy({ params, request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const userRole = (request as any).user.role
      const { id } = params

      const review = await Review.findById(id)

      if (!review) {
        return response.status(404).json({
          message: 'Không tìm thấy đánh giá',
        })
      }

      // Check ownership or admin
      if (review.user.toString() !== userId && userRole !== 'admin') {
        return response.status(403).json({
          message: 'Bạn không có quyền xóa đánh giá này',
        })
      }

      const productId = review.product
      await Review.findByIdAndDelete(id)

      // Update product rating
      await this.updateProductRating(productId)

      return response.json({
        message: 'Xóa đánh giá thành công',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful({ params, request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { id } = params

      const review = await Review.findById(id)

      if (!review) {
        return response.status(404).json({
          message: 'Không tìm thấy đánh giá',
        })
      }

      // Check if already marked
      const alreadyMarked = review.helpfulBy?.some((uid: any) => uid.toString() === userId)

      if (alreadyMarked) {
        // Remove helpful mark
        review.helpfulBy = review.helpfulBy?.filter((uid: any) => uid.toString() !== userId) || []
        review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1)
      } else {
        // Add helpful mark
        review.helpfulBy = review.helpfulBy || []
        review.helpfulBy.push(userId)
        review.helpfulCount = (review.helpfulCount || 0) + 1
      }

      await review.save()

      return response.json({
        message: alreadyMarked ? 'Đã bỏ đánh dấu hữu ích' : 'Đã đánh dấu hữu ích',
        review,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get current user's reviews
   */
  async getMyReviews({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id

      const reviews = await Review.find({ user: userId })
        .populate('product', 'name imageUrl')
        .populate('order', 'orderNumber')
        .sort({ createdAt: -1 })
        .lean()

      return response.json({
        reviews,
        total: reviews.length,
      })
    } catch (error) {
      console.error('Get my reviews error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Helper: Update product rating
   */
  private async updateProductRating(productId: any) {
    try {
      const reviews = await Review.find({ product: productId, isApproved: true })

      if (reviews.length === 0) {
        await Product.findByIdAndUpdate(productId, {
          'rating.average': 0,
          'rating.count': 0,
        })
        return
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / reviews.length

      await Product.findByIdAndUpdate(productId, {
        'rating.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal
        'rating.count': reviews.length,
      })
    } catch (error) {
      console.error('Update product rating error:', error)
    }
  }

  /**
   * Show reviews page (Inertia - Admin only)
   */
  async showReviews({ inertia, request }: HttpContext) {
    const { page = 1, limit = 20, isApproved, search } = request.qs()

    const filter: any = {}
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true'
    if (search) {
      filter.$or = [{ comment: new RegExp(search, 'i') }]
    }

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'username email')
        .populate('product', 'name brand images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(filter),
    ])

    return inertia.render('admin/reviews', {
      reviews: reviews.map((review: any) => ({
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
        isApproved: review.isApproved,
        user: review.user
          ? {
              id: review.user._id?.toString(),
              username: review.user.username,
              email: review.user.email,
            }
          : null,
        product: review.product
          ? {
              id: review.product._id?.toString(),
              name: review.product.name,
              brand: review.product.brand,
            }
          : null,
        createdAt: review.createdAt,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: { isApproved, search },
      currentPath: '/admin/reviews',
    })
  }
}
