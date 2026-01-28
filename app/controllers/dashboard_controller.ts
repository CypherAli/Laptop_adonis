import type { HttpContext } from '@adonisjs/core/http'
import { Product } from '#models/product'
import { Order } from '#models/order'
import { User } from '#models/user'
import { Review } from '#models/review'

export default class DashboardController {
  /**
   * Display admin dashboard with statistics
   */
  async index({ view }: HttpContext) {
    // Get user statistics
    const [totalClients, totalPartners, totalAdmins, pendingPartners] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'partner' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'partner', isApproved: false }),
    ])

    // Get product statistics
    const totalProducts = await Product.countDocuments()
    const activeProducts = await Product.countDocuments({ isActive: true })
    const outOfStockProducts = await Product.countDocuments({
      $or: [{ 'variants.stock': 0 }, { 'variants.stock': { $exists: false } }],
    })
    const lowStockProducts = await Product.countDocuments({
      'variants.stock': { $gt: 0, $lte: 10 },
    })

    // Get order statistics
    const totalOrders = await Order.countDocuments()
    const pendingOrders = await Order.countDocuments({ status: 'pending' })
    const processingOrders = await Order.countDocuments({ status: 'processing' })
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' })

    // Get revenue statistics
    const paidOrders = await Order.find({ paymentStatus: 'paid' })
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Get review statistics
    const totalReviews = await Review.countDocuments()
    const pendingReviews = await Review.countDocuments({ isApproved: false })

    // Get recent orders (last 10)
    const recentOrders = await Order.find()
      .select('orderNumber totalAmount status createdAt user')
      .populate({
        path: 'user',
        select: 'username email',
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Get low stock products
    const lowStockProductsList = await Product.find({
      'variants.stock': { $lt: 5, $gte: 0 },
      'isActive': true,
    })
      .limit(10)
      .lean()

    return view.render('pages/admin/dashboard-clean', {
      stats: {
        totalClients,
        totalPartners,
        totalAdmins,
        pendingPartners,
        totalProducts,
        activeProducts,
        outOfStockProducts,
        lowStockProducts,
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        totalRevenue,
        totalReviews,
        pendingReviews,
      },
      recentOrders,
      lowStockProducts: lowStockProductsList,
    })
  }
}
