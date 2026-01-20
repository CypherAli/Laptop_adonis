import type { HttpContext } from '@adonisjs/core/http'
import { Cart } from '#models/cart'
import { Product } from '#models/product'

export default class CartsController {
  /**
   * Get current user's cart
   */
  async index({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id

      let cart = await Cart.findOne({ user: userId })
        .populate('items.product')
        .populate('items.seller', 'username shopName')
        .lean()

      if (!cart) {
        // Create empty cart if not exists
        cart = await Cart.create({ user: userId, items: [] })
        return response.json({ items: [] })
      }

      return response.json({ items: cart.items || [] })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Add item to cart
   */
  async addItem({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      let {
        productId,
        variantSku,
        quantity = 1,
      } = request.only(['productId', 'variantSku', 'quantity'])

      // Validation
      if (!productId) {
        return response.status(400).json({
          message: 'Product ID là bắt buộc',
        })
      }

      // Find product
      const product = await Product.findById(productId).populate('createdBy', 'username shopName')

      if (!product) {
        return response.status(404).json({
          message: 'Không tìm thấy sản phẩm',
        })
      }

      // If no variantSku provided, use the first available variant
      if (!variantSku) {
        const firstAvailableVariant = product.variants.find((v) => v.isAvailable && v.stock > 0)
        if (!firstAvailableVariant) {
          return response.status(400).json({
            message: 'Sản phẩm này hiện đã hết hàng',
          })
        }
        variantSku = firstAvailableVariant.sku
      }

      // Find variant
      const variant = product.variants.find((v) => v.sku === variantSku)

      if (!variant) {
        return response.status(404).json({
          message: 'Không tìm thấy biến thể',
        })
      }

      if (!variant.isAvailable) {
        return response.status(400).json({
          message: 'Biến thể này hiện không khả dụng',
        })
      }

      if (variant.stock < quantity) {
        return response.status(400).json({
          message: `Chỉ còn ${variant.stock} sản phẩm`,
        })
      }

      // Use findOneAndUpdate for atomic operation
      const existingCart = await Cart.findOne({ user: userId })

      if (existingCart) {
        // Check if item already exists
        const existingItem = existingCart.items.find(
          (item) => item.product.toString() === productId && item.variantSku === variantSku
        )

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity

          if (newQuantity > variant.stock) {
            return response.status(400).json({
              message: `Chỉ còn ${variant.stock} sản phẩm`,
            })
          }

          // Atomic update existing item
          await Cart.findOneAndUpdate(
            {
              'user': userId,
              'items.product': productId,
              'items.variantSku': variantSku,
            },
            {
              $set: {
                'items.$.quantity': newQuantity,
                'items.$.price': variant.price,
              },
            }
          )
        } else {
          // Atomic add new item
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                items: {
                  product: product._id,
                  variantSku: variant.sku,
                  seller: product.createdBy._id,
                  sellerName:
                    (product.createdBy as any).shopName || (product.createdBy as any).username,
                  quantity,
                  price: variant.price,
                  addedAt: new Date(),
                },
              },
            }
          )
        }
      } else {
        // Create new cart
        await Cart.create({
          user: userId,
          items: [
            {
              product: product._id,
              variantSku: variant.sku,
              seller: product.createdBy._id,
              sellerName:
                (product.createdBy as any).shopName || (product.createdBy as any).username,
              quantity,
              price: variant.price,
              addedAt: new Date(),
            },
          ],
        })
      }

      // Get updated cart
      const populatedCart = await Cart.findOne({ user: userId })
        .populate('items.product')
        .populate('items.seller', 'username shopName')
        .lean()

      return response.json({
        message: 'Đã thêm vào giỏ hàng',
        items: populatedCart?.items || [],
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Update cart item quantity
   */
  async updateItem({ params, request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { itemId } = params
      const { quantity } = request.only(['quantity'])

      if (!quantity || quantity < 1) {
        return response.status(400).json({
          message: 'Số lượng phải lớn hơn 0',
        })
      }

      const cart = await Cart.findOne({ user: userId })

      if (!cart) {
        return response.status(404).json({
          message: 'Không tìm thấy giỏ hàng',
        })
      }

      const itemIndex = cart.items.findIndex((item) => (item as any)._id?.toString() === itemId)

      if (itemIndex === -1) {
        return response.status(404).json({
          message: 'Không tìm thấy sản phẩm trong giỏ hàng',
        })
      }

      // Check product stock
      const product = await Product.findById(cart.items[itemIndex].product)
      const variant = product?.variants.find((v) => v.sku === cart.items[itemIndex].variantSku)

      if (!variant || variant.stock < quantity) {
        return response.status(400).json({
          message: `Chỉ còn ${variant?.stock || 0} sản phẩm`,
        })
      }

      cart.items[itemIndex].quantity = quantity
      await cart.save()

      const updatedCart = await Cart.findById(cart._id)
        .populate('items.product')
        .populate('items.seller', 'username shopName')
        .lean()

      return response.json({
        message: 'Đã cập nhật giỏ hàng',
        items: updatedCart?.items || [],
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem({ params, request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { itemId } = params

      const cart = await Cart.findOne({ user: userId })

      if (!cart) {
        return response.status(404).json({
          message: 'Không tìm thấy giỏ hàng',
        })
      }

      cart.items = cart.items.filter((item) => (item as any)._id?.toString() !== itemId)
      await cart.save()

      const updatedCart = await Cart.findById(cart._id)
        .populate('items.product')
        .populate('items.seller', 'username shopName')
        .lean()

      return response.json({
        message: 'Đã xóa sản phẩm khỏi giỏ hàng',
        items: updatedCart?.items || [],
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Clear cart
   */
  async clear({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id

      await Cart.findOneAndUpdate({ user: userId }, { items: [] })

      return response.json({
        message: 'Đã xóa toàn bộ giỏ hàng',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }
}
