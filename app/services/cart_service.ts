/**
 * Cart Service
 * Business logic for cart operations
 */

import { Cart } from '#models/cart'
import { Product } from '#models/product'
import { logger } from '#utils/logger'
import { ERROR_MESSAGES } from '#utils/constants'
import type { ObjectId } from 'mongoose'

export interface AddToCartInput {
  userId: string | ObjectId
  productId: string
  variantSku?: string
  quantity?: number
}

export interface UpdateCartItemInput {
  userId: string | ObjectId
  itemId: string
  quantity: number
}

export class CartService {
  /**
   * Get user's cart with populated product details
   */
  static async getCart(userId: string | ObjectId) {
    try {
      let cart = await Cart.findOne({ user: userId })
        .populate({
          path: 'items.product',
          select: 'name brand imageUrl variants',
        })
        .populate({
          path: 'items.seller',
          select: 'username shopName',
        })
        .lean()

      if (!cart) {
        // Create empty cart if not exists
        cart = await Cart.create({ user: userId, items: [] })
        return { items: [] }
      }

      // Filter out items with deleted products
      const validItems = cart.items.filter((item: any) => item.product !== null)

      return { items: validItems }
    } catch (error) {
      logger.error('Error getting cart', error, { userId })
      throw error
    }
  }

  /**
   * Add item to cart
   */
  static async addItem({ userId, productId, variantSku, quantity = 1 }: AddToCartInput) {
    try {
      // Find product
      const product = await Product.findById(productId).populate('createdBy', 'username shopName')

      if (!product) {
        throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND)
      }

      // If no variantSku provided, use the first available variant
      let selectedVariantSku = variantSku
      if (!selectedVariantSku) {
        const firstAvailableVariant = product.variants.find(
          (v: any) => v.isAvailable && v.stock > 0
        )
        if (!firstAvailableVariant) {
          throw new Error(ERROR_MESSAGES.OUT_OF_STOCK)
        }
        selectedVariantSku = firstAvailableVariant.sku
      }

      // Find variant
      const variant = product.variants.find((v: any) => v.sku === selectedVariantSku)

      if (!variant) {
        throw new Error('Không tìm thấy biến thể')
      }

      if (!variant.isAvailable) {
        throw new Error('Biến thể này hiện không khả dụng')
      }

      if (variant.stock < quantity) {
        throw new Error(`Chỉ còn ${variant.stock} sản phẩm`)
      }

      // Use findOneAndUpdate for atomic operation
      const existingCart = await Cart.findOne({ user: userId })

      if (existingCart) {
        // Check if item already exists
        const existingItem = existingCart.items.find(
          (item: any) =>
            item.product.toString() === productId && item.variantSku === selectedVariantSku
        )

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity

          if (newQuantity > variant.stock) {
            throw new Error(`Chỉ còn ${variant.stock} sản phẩm`)
          }

          // Update existing item quantity
          await Cart.findOneAndUpdate(
            {
              'user': userId,
              'items.product': productId,
              'items.variantSku': selectedVariantSku,
            },
            {
              $inc: { 'items.$.quantity': quantity },
            },
            { new: true }
          )
        } else {
          // Add new item
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                items: {
                  product: productId,
                  variantSku: selectedVariantSku,
                  quantity,
                  seller: product.createdBy?._id || null,
                },
              },
            },
            { new: true }
          )
        }
      } else {
        // Create new cart with item
        await Cart.create({
          user: userId,
          items: [
            {
              product: productId,
              variantSku: selectedVariantSku,
              quantity,
              seller: product.createdBy?._id || null,
            },
          ],
        })
      }

      logger.info('Item added to cart', {
        userId,
        productId,
        variantSku: selectedVariantSku,
        quantity,
      })

      // Return updated cart
      return this.getCart(userId)
    } catch (error) {
      logger.error('Error adding item to cart', error, { userId, productId })
      throw error
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateItem({ userId, itemId, quantity }: UpdateCartItemInput) {
    try {
      if (quantity <= 0) {
        throw new Error(ERROR_MESSAGES.INVALID_QUANTITY)
      }

      const cart = await Cart.findOne({ user: userId })

      if (!cart) {
        throw new Error(ERROR_MESSAGES.EMPTY_CART)
      }

      const item = cart.items.find((i: any) => i._id?.toString() === itemId)

      if (!item) {
        throw new Error('Không tìm thấy sản phẩm trong giỏ hàng')
      }

      // Check stock availability
      const product = await Product.findById(item.product)
      if (!product) {
        throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND)
      }

      const variant = product.variants.find((v: any) => v.sku === item.variantSku)
      if (!variant || variant.stock < quantity) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_STOCK)
      }

      // Update quantity
      await Cart.findOneAndUpdate(
        { 'user': userId, 'items._id': itemId },
        { $set: { 'items.$.quantity': quantity } },
        { new: true }
      )

      logger.info('Cart item updated', { userId, itemId, quantity })

      return this.getCart(userId)
    } catch (error) {
      logger.error('Error updating cart item', error, { userId, itemId })
      throw error
    }
  }

  /**
   * Remove item from cart
   */
  static async removeItem(userId: string | ObjectId, itemId: string) {
    try {
      await Cart.findOneAndUpdate({ user: userId }, { $pull: { items: { _id: itemId } } })

      logger.info('Item removed from cart', { userId, itemId })

      return this.getCart(userId)
    } catch (error) {
      logger.error('Error removing item from cart', error, { userId, itemId })
      throw error
    }
  }

  /**
   * Clear cart
   */
  static async clearCart(userId: string | ObjectId) {
    try {
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } })

      logger.info('Cart cleared', { userId })

      return { items: [] }
    } catch (error) {
      logger.error('Error clearing cart', error, { userId })
      throw error
    }
  }

  /**
   * Get cart items count
   */
  static async getCartCount(userId: string | ObjectId): Promise<number> {
    try {
      const cart = await Cart.findOne({ user: userId }).lean()
      return cart?.items?.length || 0
    } catch (error) {
      logger.error('Error getting cart count', error, { userId })
      return 0
    }
  }
}
