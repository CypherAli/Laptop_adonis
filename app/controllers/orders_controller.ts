import type { HttpContext } from '@adonisjs/core/http'
import { Order } from '#models/order'
import { Product } from '#models/product'
import { Cart } from '#models/cart'
import mongoose from 'mongoose'

export default class OrdersController {
  /**
   * Get all orders for current user
   */
  async index({ request, response }: HttpContext) {
    try {
      const user = (request as any).user

      if (!user || !user.id) {
        return response.status(401).json({
          message: 'Vui lòng đăng nhập để xem đơn hàng',
        })
      }

      const { page = 1, limit = 10, status } = request.qs()

      // TẤT CẢ USERS chỉ xem orders của chính họ (những đơn họ đã mua)
      const filter: any = {
        user: new mongoose.Types.ObjectId(user.id),
      }

      if (status) {
        filter.status = status
      }

      const pageNum = Number(page)
      const limitNum = Number(limit)
      const skip = (pageNum - 1) * limitNum

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate({
            path: 'items.product',
            select: 'name brand images variants createdBy',
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Order.countDocuments(filter),
      ])

      return response.json({
        orders,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalOrders: total,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get single order by ID
   */
  async show({ params, request, response }: HttpContext) {
    try {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID đơn hàng không hợp lệ',
        })
      }

      const order = await Order.findById(params.id)
        .populate({
          path: 'user',
          select: 'username email phone',
        })
        .populate({
          path: 'items.product',
          select: 'name brand images variants createdBy',
          populate: {
            path: 'createdBy',
            select: 'username shopName phone email',
          },
        })
        .lean()

      if (!order) {
        return response.status(404).json({
          message: 'Không tìm thấy đơn hàng',
        })
      }

      // Check ownership
      const user = (request as any).user
      const productSellers = order.items
        .map((item: any) => item.product?.createdBy?._id?.toString())
        .filter(Boolean)

      if (
        order.user._id.toString() !== user?.id &&
        user?.role !== 'admin' &&
        !productSellers.includes(user?.id)
      ) {
        return response.status(403).json({
          message: 'Bạn không có quyền xem đơn hàng này',
        })
      }

      return response.json({ order })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Create new order
   */
  async store({ request, response }: HttpContext) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const userId = (request as any).user.id
      const { items, shippingAddress, paymentMethod, notes } = request.only([
        'items',
        'shippingAddress',
        'paymentMethod',
        'notes',
      ])

      // Validation
      if (!items || items.length === 0) {
        await session.abortTransaction()
        return response.status(400).json({
          message: 'Giỏ hàng trống',
        })
      }

      if (
        !shippingAddress ||
        !shippingAddress.fullName ||
        !shippingAddress.phone ||
        !shippingAddress.address?.street ||
        !shippingAddress.address?.district ||
        !shippingAddress.address?.city
      ) {
        await session.abortTransaction()
        return response.status(400).json({
          message: 'Địa chỉ giao hàng không đầy đủ thông tin',
        })
      }

      // Process order items
      const orderItems = []
      let subtotal = 0

      for (const item of items) {
        // Use findOneAndUpdate with session to lock the document
        const product = await Product.findById(item.product).session(session)

        if (!product) {
          await session.abortTransaction()
          return response.status(404).json({
            message: `Sản phẩm ${item.product} không tồn tại`,
          })
        }

        // Find the variant
        const variant = product.variants.find((v: any) => v.sku === item.variantSku)

        if (!variant) {
          await session.abortTransaction()
          return response.status(404).json({
            message: `Biến thể ${item.variantSku} không tồn tại`,
          })
        }

        if (!variant.isAvailable) {
          await session.abortTransaction()
          return response.status(400).json({
            message: `Biến thể ${variant.variantName} hiện không khả dụng`,
          })
        }

        // Critical: Check stock
        if (variant.stock < item.quantity) {
          await session.abortTransaction()
          return response.status(400).json({
            message: `Biến thể ${variant.variantName} không đủ số lượng. Còn ${variant.stock} sản phẩm`,
          })
        }

        const itemPrice = variant.price * item.quantity
        subtotal += itemPrice

        // Chỉ lưu references và price
        // Khi cần hiển thị → populate từ Product collection
        // Price được lưu để tính tổng tiền, tránh thay đổi bill
        orderItems.push({
          product: product._id,
          variantSku: variant.sku,
          quantity: item.quantity,
          price: variant.price, // Lưu giá để tính bill, không bị ảnh hưởng khi admin sửa giá
          status: 'confirmed',
          statusHistory: [
            {
              status: 'confirmed',
              note: 'Đơn hàng đã được xác nhận',
              timestamp: new Date(),
            },
          ],
        })

        // Update variant stock atomically
        variant.stock -= item.quantity
        product.soldCount = (product.soldCount || 0) + item.quantity
        await product.save({ session })
      }

      // Calculate totals
      const shippingFee = 30000 // Fixed shipping fee
      const tax = 0
      const discount = 0
      const totalAmount = subtotal + shippingFee + tax - discount

      // Create order with session
      const order = new Order({
        user: userId,
        items: orderItems,
        subtotal,
        shippingFee,
        tax,
        discount,
        totalAmount,
        shippingAddress,
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: 'pending',
        notes,
        status: 'confirmed',
        statusHistory: [
          {
            status: 'confirmed',
            note: 'Đơn hàng đã được xác nhận',
            updatedBy: userId,
            timestamp: new Date(),
          },
        ],
      })

      await order.save({ session })

      // Clear cart after order with session
      await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { session })

      // Commit transaction
      await session.commitTransaction()

      return response.status(201).json({
        message: 'Đặt hàng thành công',
        order,
      })
    } catch (error) {
      // Rollback on error
      await session.abortTransaction()
      console.error('Create order error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    } finally {
      session.endSession()
    }
  }

  /**
   * Update order status (Admin/Partner only)
   */
  async updateStatus({ params, request, response }: HttpContext) {
    try {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID đơn hàng không hợp lệ',
        })
      }

      const { status, note } = request.only(['status', 'note'])
      const user = (request as any).user

      const order = await Order.findById(params.id).populate('items.product', 'createdBy')

      if (!order) {
        return response.status(404).json({
          message: 'Không tìm thấy đơn hàng',
        })
      }

      // Check permissions
      const isAdmin = user.role === 'admin'
      const isOrderSeller = order.items.some(
        (item: any) => item.product?.createdBy?.toString() === user.id
      )

      if (!isAdmin && !isOrderSeller) {
        return response.status(403).json({
          message: 'Bạn không có quyền cập nhật đơn hàng này',
        })
      }

      // Update status
      order.status = status
      order.statusHistory.push({
        status,
        note: note || `Đơn hàng ${status}`,
        updatedBy: user?.id,
        timestamp: new Date(),
      })

      if (status === 'delivered') {
        order.actualDelivery = new Date()
      }

      await order.save()

      return response.json({
        message: 'Cập nhật trạng thái đơn hàng thành công',
        order,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Cancel order
   */
  async cancel({ params, request, response }: HttpContext) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        await session.abortTransaction()
        return response.status(400).json({
          message: 'ID đơn hàng không hợp lệ',
        })
      }

      const { reason } = request.only(['reason'])
      const userId = (request as any).user.id

      const order = await Order.findById(params.id).session(session)

      if (!order) {
        await session.abortTransaction()
        return response.status(404).json({
          message: 'Không tìm thấy đơn hàng',
        })
      }

      // Check ownership
      if (order.user.toString() !== userId && (request as any).user.role !== 'admin') {
        await session.abortTransaction()
        return response.status(403).json({
          message: 'Bạn không có quyền hủy đơn hàng này',
        })
      }

      // Can only cancel pending/confirmed orders
      if (!['pending', 'confirmed'].includes(order.status)) {
        await session.abortTransaction()
        return response.status(400).json({
          message: 'Không thể hủy đơn hàng ở trạng thái này',
        })
      }

      // Restore product stock atomically
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session)
        if (product) {
          const variant = product.variants.find((v: any) => v.sku === item.variantSku)
          if (variant) {
            variant.stock += item.quantity
          }
          product.soldCount = Math.max(0, (product.soldCount || 0) - item.quantity)
          await product.save({ session })
        }
      }

      // Update order status
      order.status = 'cancelled'
      order.cancelReason = reason || 'Người dùng hủy đơn'
      order.statusHistory.push({
        status: 'cancelled',
        note: reason || 'Người dùng hủy đơn',
        updatedBy: userId,
        timestamp: new Date(),
      })

      await order.save({ session })

      // Commit transaction
      await session.commitTransaction()

      return response.json({
        message: 'Hủy đơn hàng thành công',
        order,
      })
    } catch (error) {
      await session.abortTransaction()
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    } finally {
      session.endSession()
    }
  }
}
