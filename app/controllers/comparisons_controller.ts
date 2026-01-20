import type { HttpContext } from '@adonisjs/core/http'
import { Product } from '#models/product'

export default class ComparisonsController {
  /**
   * Compare multiple products
   * POST /api/comparisons/compare
   */
  async compare({ request, response }: HttpContext) {
    try {
      const { productIds } = request.only(['productIds'])

      if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
        return response.badRequest({
          success: false,
          message: 'Vui lòng chọn ít nhất 2 sản phẩm để so sánh',
        })
      }

      if (productIds.length > 4) {
        return response.badRequest({
          success: false,
          message: 'Bạn chỉ có thể so sánh tối đa 4 sản phẩm',
        })
      }

      // Fetch products
      const products = await Product.find({
        _id: { $in: productIds },
      })

      if (products.length !== productIds.length) {
        return response.badRequest({
          success: false,
          message: 'Một số sản phẩm không tồn tại',
        })
      }

      // Format products for comparison
      const formattedProducts = products.map((product: any) => {
        // Calculate price from variants or use base price
        let price = product.basePrice || 0
        let displayPrice = product.displayPrice || price

        if (product.variants && product.variants.length > 0) {
          const prices = product.variants.map((v: any) => v.price || 0).filter((p: number) => p > 0)
          if (prices.length > 0) {
            price = Math.min(...prices)
            displayPrice = product.finalPrice || product.displayPrice || price
          }
        }

        // Calculate total stock from variants
        let stock = 0
        if (product.variants && product.variants.length > 0) {
          stock = product.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
        } else {
          stock = product.stock || 0
        }

        return {
          _id: product._id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          imageUrl: product.images?.[0] || '/placeholder.jpg',
          price: displayPrice,
          originalPrice: product.basePrice,
          stock: stock,
          rating: {
            average: product.averageRating || 0,
            count: product.reviewCount || 0,
          },
          specifications: product.specifications || {},
          warranty: product.warranty || {},
          features: product.features || [],
          description: product.description,
        }
      })

      return response.ok({
        success: true,
        products: formattedProducts,
        comparisonId: null, // For future saved comparisons
      })
    } catch (error) {
      console.error('Comparison error:', error)
      return response.internalServerError({
        success: false,
        message: 'Không thể so sánh sản phẩm',
      })
    }
  }

  /**
   * Save comparison for sharing (optional feature)
   * POST /api/comparisons/save
   */
  async save({ request, response }: HttpContext) {
    try {
      const { productIds, isPublic } = request.only(['productIds', 'isPublic'])

      // For now, just return a mock slug since we don't have a Comparison model
      // You can implement full save functionality later if needed
      const slug = `compare-${Date.now()}`

      return response.ok({
        success: true,
        comparison: {
          slug,
          productIds,
          isPublic: isPublic || false,
          createdBy: null,
        },
      })
    } catch (error) {
      console.error('Save comparison error:', error)
      return response.internalServerError({
        success: false,
        message: 'Không thể lưu so sánh',
      })
    }
  }

  /**
   * Get saved comparison by slug (optional feature)
   * GET /api/comparisons/:slug
   */
  async getBySlug({ response }: HttpContext) {
    try {
      // Mock implementation - return empty for now
      return response.notFound({
        success: false,
        message: 'Không tìm thấy so sánh này',
      })
    } catch (error) {
      console.error('Get comparison error:', error)
      return response.internalServerError({
        success: false,
        message: 'Không thể tải so sánh',
      })
    }
  }
}
