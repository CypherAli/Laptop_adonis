import type { HttpContext } from '@adonisjs/core/http'
import { CartService } from '#services/cart_service'
import { ResponseHelper } from '#utils/response'
import { ERROR_MESSAGES, USER_ROLES } from '#utils/constants'
import { logger } from '#utils/logger'

export default class CartsController {
  /**
   * Get current user's cart
   */
  async index({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const userId = user?.id

      if (!userId) {
        return ResponseHelper.unauthorized(response)
      }

      // Admin không có giỏ hàng
      if (user.role === USER_ROLES.ADMIN) {
        return ResponseHelper.forbidden(response, ERROR_MESSAGES.ADMIN_NO_CART)
      }

      const cart = await CartService.getCart(userId)
      return ResponseHelper.success(response, cart)
    } catch (error) {
      logger.error('Cart index error', error)
      return ResponseHelper.serverError(response, 'Lỗi server khi lấy giỏ hàng')
    }
  }

  /**
   * Add item to cart
   */
  async addItem({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const userId = user.id

      // Admin không có giỏ hàng
      if (user.role === USER_ROLES.ADMIN) {
        return ResponseHelper.forbidden(response, ERROR_MESSAGES.ADMIN_NO_CART)
      }

      const {
        productId,
        variantSku,
        quantity = 1,
      } = request.only(['productId', 'variantSku', 'quantity'])

      if (!productId) {
        return ResponseHelper.badRequest(response, 'Product ID là bắt buộc')
      }

      const cart = await CartService.addItem({ userId, productId, variantSku, quantity })
      return ResponseHelper.success(response, cart, 'Đã thêm vào giỏ hàng')
    } catch (error) {
      logger.error('Add to cart error', error)
      return ResponseHelper.badRequest(response, error.message)
    }
  }

  /**
   * Update cart item quantity
   */
  async updateItem({ params, request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const userId = user.id

      // Admin không có giỏ hàng
      if (user.role === USER_ROLES.ADMIN) {
        return ResponseHelper.forbidden(response, ERROR_MESSAGES.ADMIN_NO_CART)
      }

      const { itemId } = params
      const { quantity } = request.only(['quantity'])

      if (!quantity || quantity < 1) {
        return ResponseHelper.badRequest(response, ERROR_MESSAGES.INVALID_QUANTITY)
      }

      const cart = await CartService.updateItem({ userId, itemId, quantity })
      return ResponseHelper.success(response, cart, 'Đã cập nhật giỏ hàng')
    } catch (error) {
      logger.error('Update cart item error', error)
      return ResponseHelper.badRequest(response, error.message)
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem({ params, request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const userId = user.id

      // Admin không có giỏ hàng
      if (user.role === USER_ROLES.ADMIN) {
        return ResponseHelper.forbidden(response, ERROR_MESSAGES.ADMIN_NO_CART)
      }

      const { itemId } = params

      const cart = await CartService.removeItem(userId, itemId)
      return ResponseHelper.success(response, cart, 'Đã xóa sản phẩm khỏi giỏ hàng')
    } catch (error) {
      logger.error('Remove cart item error', error)
      return ResponseHelper.badRequest(response, error.message)
    }
  }

  /**
   * Clear cart
   */
  async clear({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const userId = user.id

      // Admin không có giỏ hàng
      if (user.role === USER_ROLES.ADMIN) {
        return ResponseHelper.forbidden(response, ERROR_MESSAGES.ADMIN_NO_CART)
      }

      const cart = await CartService.clearCart(userId)
      return ResponseHelper.success(response, cart, 'Đã xóa tất cả sản phẩm')
    } catch (error) {
      logger.error('Clear cart error', error)
      return ResponseHelper.serverError(response, 'Lỗi server')
    }
  }
}
