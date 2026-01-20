import type { HttpContext } from '@adonisjs/core/http'
import { User } from '#models/user'
import { Product } from '#models/product'

export default class WishlistController {
  /**
   * Get user's wishlist
   */
  async index({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id

      const user = await User.findById(userId).populate({
        path: 'wishlist',
        model: 'Product',
        select: 'name brand category basePrice variants images isActive',
      })

      if (!user) {
        return response.status(404).json({
          message: 'User not found',
        })
      }

      // Filter out inactive products
      const wishlist = (user.wishlist || [])
        .filter((product: any) => product && product.isActive)
        .map((product: any) => ({
          product: {
            _id: product._id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            basePrice: product.basePrice,
            price:
              product.variants && product.variants.length > 0
                ? product.variants[0].price
                : product.basePrice,
            imageUrl: product.images?.[0] || null,
            images: product.images,
            variants: product.variants,
            stock:
              product.variants && product.variants.length > 0
                ? product.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
                : 0,
          },
          addedAt: new Date(),
        }))

      return response.json(wishlist)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      return response.status(500).json({
        message: 'Failed to fetch wishlist',
        error: error.message,
      })
    }
  }

  /**
   * Add product to wishlist
   */
  async add({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { productId } = request.only(['productId'])

      if (!productId) {
        return response.status(400).json({
          message: 'Product ID is required',
        })
      }

      // Check if product exists
      const product = await Product.findById(productId)
      if (!product) {
        return response.status(404).json({
          message: 'Product not found',
        })
      }

      // Add to wishlist (using $addToSet to avoid duplicates)
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { wishlist: productId },
        },
        { new: true }
      ).populate({
        path: 'wishlist',
        model: 'Product',
        select: 'name brand category basePrice variants images isActive',
      })

      if (!user) {
        return response.status(404).json({
          message: 'User not found',
        })
      }

      return response.json({
        message: 'Product added to wishlist',
        wishlist: user.wishlist,
      })
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      return response.status(500).json({
        message: 'Failed to add to wishlist',
        error: error.message,
      })
    }
  }

  /**
   * Remove product from wishlist
   */
  async remove({ request, response, params }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { productId } = params

      if (!productId) {
        return response.status(400).json({
          message: 'Product ID is required',
        })
      }

      // Remove from wishlist
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { wishlist: productId },
        },
        { new: true }
      )

      if (!user) {
        return response.status(404).json({
          message: 'User not found',
        })
      }

      return response.json({
        message: 'Product removed from wishlist',
      })
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      return response.status(500).json({
        message: 'Failed to remove from wishlist',
        error: error.message,
      })
    }
  }

  /**
   * Clear all wishlist items
   */
  async clear({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: { wishlist: [] },
        },
        { new: true }
      )

      if (!user) {
        return response.status(404).json({
          message: 'User not found',
        })
      }

      return response.json({
        message: 'Wishlist cleared',
      })
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      return response.status(500).json({
        message: 'Failed to clear wishlist',
        error: error.message,
      })
    }
  }

  /**
   * Check if product is in wishlist
   */
  async check({ request, response, params }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { productId } = params

      if (!productId) {
        return response.status(400).json({
          message: 'Product ID is required',
        })
      }

      const user = await User.findById(userId).select('wishlist')

      if (!user) {
        return response.status(404).json({
          message: 'User not found',
        })
      }

      const isInWishlist = user.wishlist?.some((id) => id.toString() === productId)

      return response.json({
        isInWishlist: !!isInWishlist,
      })
    } catch (error) {
      console.error('Error checking wishlist:', error)
      return response.status(500).json({
        message: 'Failed to check wishlist',
        error: error.message,
      })
    }
  }
}
