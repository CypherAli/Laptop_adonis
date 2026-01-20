import type { HttpContext } from '@adonisjs/core/http'
import { Product } from '#models/product'
import { Order } from '#models/order'
import { User } from '#models/user'

export default class DashboardController {
  /**
   * Display admin dashboard with statistics
   */
  async index({ view }: HttpContext) {
    // Get statistics
    const totalProducts = await Product.countDocuments()
    const activeProducts = await Product.countDocuments({ isActive: true })
    const totalOrders = await Order.countDocuments()

    const pendingOrders = await Order.countDocuments({ status: 'pending' })
    const processingOrders = await Order.countDocuments({ status: 'processing' })
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' })

    // Get revenue statistics
    const paidOrders = await Order.find({ paymentStatus: 'paid' })
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Get recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5)

    // Get low stock products (check variants)
    const lowStockProducts = await Product.find({
      'variants.stock': { $lt: 5 },
      'variants.isAvailable': true,
      'isActive': true,
    }).limit(10)

    return view.render('pages/admin/dashboard', {
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        totalRevenue,
      },
      recentOrders,
      lowStockProducts,
    })
  }
}
