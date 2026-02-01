import type { HttpContext } from '@adonisjs/core/http'
import mongoose from 'mongoose'
import { User } from '#models/user'
import { Product } from '#models/product'
import { Order } from '#models/order'
import { Review } from '#models/review'
import { Category } from '#models/category'
import { Brand } from '#models/brand'
import { Settings } from '#models/settings'

export default class AdminController {
  /**
   * Get admin statistics - API JSON endpoint (cho SPA cũ)
   */
  async stats({ response }: HttpContext) {
    try {
      const [
        totalClients,
        totalPartners,
        totalAdmins,
        totalProducts,
        totalOrders,
        pendingPartners,
        activeProducts,
        outOfStockProducts,
        lowStockProducts,
        totalReviews,
        pendingReviews,
      ] = await Promise.all([
        User.countDocuments({ role: 'client' }),
        User.countDocuments({ role: 'partner' }),
        User.countDocuments({ role: 'admin' }),
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments({ role: 'partner', isApproved: false }),
        Product.countDocuments({ 'variants.stock': { $gt: 0 } }),
        Product.countDocuments({
          $or: [{ 'variants.stock': 0 }, { 'variants.stock': { $exists: false } }],
        }),
        Product.countDocuments({
          'variants.stock': { $gt: 0, $lte: 10 },
        }),
        Review.countDocuments(),
        Review.countDocuments({ isApproved: false }),
      ])

      // Order statistics by status
      const orderStats = await Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            total: { $sum: '$totalAmount' },
          },
        },
      ])

      // Revenue statistics
      const paidOrders = await Order.find({ paymentStatus: 'paid' })
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0)

      // Pending and delivered counts
      const pendingOrders = await Order.countDocuments({ status: 'pending' })
      const deliveredOrders = await Order.countDocuments({ status: 'delivered' })

      // API JSON Response
      return response.json({
        stats: {
          totalUsers: totalClients + totalPartners + totalAdmins,
          totalClients,
          totalPartners,
          totalAdmins,
          totalProducts,
          totalOrders,
          pendingOrders,
          deliveredOrders,
          pendingPartners,
          totalRevenue,
          activeProducts,
          outOfStockProducts,
          lowStockProducts,
          totalReviews,
          pendingReviews,
        },
        orderStats,
      })
    } catch (error) {
      console.error('❌ Admin stats error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Admin Dashboard - Inertia SSR
   */
  async dashboard({ inertia }: HttpContext) {
    try {
      // Get basic counts
      const [totalClients, totalPartners, totalAdmins, totalProducts, totalOrders] =
        await Promise.all([
          User.countDocuments({ role: 'client' }),
          User.countDocuments({ role: 'partner' }),
          User.countDocuments({ role: 'admin' }),
          Product.countDocuments(),
          Order.countDocuments(),
        ])

      // Revenue statistics
      const paidOrders = await Order.find({ paymentStatus: 'paid' })
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0)

      // Recent orders
      const recentOrders = await Order.find()
        .populate('user', 'username email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()

      // Format recent orders for display
      const formattedOrders = recentOrders.map((order: any) => ({
        id: order._id.toString(),
        customerName: order.user?.username || 'Guest',
        total: order.totalAmount,
        status: order.status,
      }))

      // Render Inertia page
      return inertia.render('admin/dashboard', {
        stats: {
          totalUsers: totalClients + totalPartners + totalAdmins,
          totalProducts,
          totalOrders,
          totalRevenue,
        },
        recentOrders: formattedOrders,
      })
    } catch (error) {
      console.error('❌ Admin dashboard error:', error)
      throw error
    }
  }

  /**
   * Get all users with filters
   */
  async getUsers({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 20, role, isActive, search } = request.qs()

      const filter: any = {}

      if (role) {
        filter.role = role
      }

      if (isActive !== undefined) {
        filter.isActive = isActive === 'true'
      }

      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { shopName: { $regex: search, $options: 'i' } },
        ]
      }

      const pageNum = Number(page)
      const limitNum = Number(limit)
      const skip = (pageNum - 1) * limitNum

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        User.countDocuments(filter),
      ])

      return response.json({
        users,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalUsers: total,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get all orders (Admin only - quản lý toàn bộ hệ thống)
   */
  async getOrders({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 20, status, search, startDate, endDate } = request.qs()

      const filter: any = {}

      if (status) {
        filter.status = status
      }

      if (search) {
        filter.orderNumber = { $regex: search, $options: 'i' }
      }

      if (startDate || endDate) {
        filter.createdAt = {}
        if (startDate) {
          filter.createdAt.$gte = new Date(startDate)
        }
        if (endDate) {
          filter.createdAt.$lte = new Date(endDate)
        }
      }

      const pageNum = Number(page)
      const limitNum = Number(limit)
      const skip = (pageNum - 1) * limitNum

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate({
            path: 'user',
            select: 'username email',
          })
          .populate({
            path: 'items.product',
            select: 'name brand images variants',
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
      console.error(' Get all orders error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Approve partner account
   */
  async approvePartner({ params, response }: HttpContext) {
    try {
      const { userId } = params

      const user = await User.findById(userId)

      if (!user) {
        return response.status(404).json({
          message: 'Không tìm thấy người dùng',
        })
      }

      if (user.role !== 'partner') {
        return response.status(400).json({
          message: 'Người dùng này không phải là partner',
        })
      }

      user.isApproved = true
      await user.save()

      return response.json({
        message: 'Đã phê duyệt partner thành công',
        user: {
          id: user._id,
          username: user.username,
          shopName: user.shopName,
          isApproved: user.isApproved,
        },
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Reject/Revoke partner approval
   */
  async rejectPartner({ params, response }: HttpContext) {
    try {
      const { userId } = params

      const user = await User.findById(userId)

      if (!user) {
        return response.status(404).json({
          message: 'Không tìm thấy người dùng',
        })
      }

      if (user.role !== 'partner') {
        return response.status(400).json({
          message: 'Người dùng này không phải là partner',
        })
      }

      user.isApproved = false
      await user.save()

      return response.json({
        message: 'Đã thu hồi phê duyệt partner',
        user: {
          id: user._id,
          username: user.username,
          shopName: user.shopName,
          isApproved: user.isApproved,
        },
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus({ params, response }: HttpContext) {
    try {
      const { userId } = params

      const user = await User.findById(userId)

      if (!user) {
        return response.status(404).json({
          message: 'Không tìm thấy người dùng',
        })
      }

      user.isActive = !user.isActive
      await user.save()

      return response.json({
        message: user.isActive ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản',
        user: {
          id: user._id,
          username: user.username,
          isActive: user.isActive,
        },
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get all products (admin view)
   */
  async getProducts({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 20, isActive, isFeatured, search } = request.qs()

      const filter: any = {}

      if (isActive !== undefined) {
        filter.isActive = isActive === 'true'
      }

      if (isFeatured !== undefined) {
        filter.isFeatured = isFeatured === 'true'
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
        ]
      }

      const pageNum = Number(page)
      const limitNum = Number(limit)
      const skip = (pageNum - 1) * limitNum

      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate('createdBy', 'username shopName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Product.countDocuments(filter),
      ])

      return response.json({
        products,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalProducts: total,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Toggle product featured status
   */
  async toggleProductFeatured({ params, response }: HttpContext) {
    try {
      const { productId } = params

      const product = await Product.findById(productId)

      if (!product) {
        return response.status(404).json({
          message: 'Không tìm thấy sản phẩm',
        })
      }

      product.isFeatured = !product.isFeatured
      await product.save()

      return response.json({
        message: product.isFeatured
          ? 'Đã đánh dấu sản phẩm nổi bật'
          : 'Đã bỏ đánh dấu sản phẩm nổi bật',
        product: {
          id: product._id,
          name: product.name,
          isFeatured: product.isFeatured,
        },
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get all reviews (pending moderation)
   */
  async getReviews({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 20, isApproved } = request.qs()

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
          .populate('product', 'name')
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
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Approve/Reject review
   */
  async moderateReview({ params, request, response }: HttpContext) {
    try {
      const { reviewId } = params
      const { isApproved } = request.only(['isApproved'])
      const adminId = (request as any).user.id

      const review = await Review.findById(reviewId)

      if (!review) {
        return response.status(404).json({
          message: 'Không tìm thấy đánh giá',
        })
      }

      review.isApproved = isApproved
      review.moderatedBy = adminId
      review.moderatedAt = new Date()
      await review.save()

      return response.json({
        message: isApproved ? 'Đã phê duyệt đánh giá' : 'Đã từ chối đánh giá',
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
   * Get analytics data
   */
  async analytics({ request, response }: HttpContext) {
    try {
      const { startDate, endDate } = request.qs()

      const dateFilter: any = {}
      if (startDate) dateFilter.$gte = new Date(startDate)
      if (endDate) dateFilter.$lte = new Date(endDate)

      const filter = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}

      // Sales by date
      const salesByDate = await Order.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            totalSales: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])

      // Top selling products
      const topProducts = await Order.aggregate([
        { $match: filter },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
      ])

      return response.json({
        salesByDate,
        topProducts,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get revenue by shop/partner
   */
  async getRevenueByShop({ response }: HttpContext) {
    try {
      const revenueByShop = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.seller',
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'partner',
          },
        },
        { $unwind: { path: '$partner', preserveNullAndEmptyArrays: true } },
        { $sort: { totalRevenue: -1 } },
      ])

      return response.json(revenueByShop)
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get partner statistics
   */
  async getPartnerStats({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const partnerId = new mongoose.Types.ObjectId(user.id)

      const [totalProducts, totalOrders, totalRevenue] = await Promise.all([
        Product.countDocuments({ partnerId }),
        Order.countDocuments({ 'items.seller': partnerId }),
        Order.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $unwind: '$items' },
          { $match: { 'items.seller': partnerId } },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            },
          },
        ]),
      ])

      return response.json({
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get partner revenue over time
   */
  async getPartnerRevenue({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const partnerId = new mongoose.Types.ObjectId(user.id)

      const revenue = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $match: { 'items.seller': partnerId } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { _id: 1 } },
      ])

      return response.json(revenue)
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get partner revenue by brand
   */
  async getPartnerRevenueByBrand({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const partnerId = new mongoose.Types.ObjectId(user.id)

      const revenueByBrand = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $match: { 'items.seller': partnerId } },
        {
          $group: {
            _id: '$items.brand',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
      ])

      return response.json(revenueByBrand)
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get categories tree
   */
  async getCategoriesTree({ response }: HttpContext) {
    try {
      // Get all categories and build tree
      const allCategories = await Category.find().lean()

      // Build tree structure
      const categoryMap = new Map()
      const rootCategories: any[] = []

      // First pass: create map
      allCategories.forEach((cat: any) => {
        categoryMap.set(cat._id.toString(), { ...cat, children: [] })
      })

      // Second pass: build tree and add product counts
      for (const cat of allCategories) {
        const category = categoryMap.get(cat._id.toString())
        const productCount = await Product.countDocuments({
          category: cat.name,
        })
        category.productCount = productCount

        if (cat.parentId) {
          const parent = categoryMap.get(cat.parentId.toString())
          if (parent) {
            parent.children.push(category)
          }
        } else {
          rootCategories.push(category)
        }
      }

      return response.json({ tree: rootCategories })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi khi lấy danh mục',
        error: error.message,
      })
    }
  }

  /**
   * Toggle category active status
   */
  async toggleCategoryActive({ params, response }: HttpContext) {
    try {
      const category = await Category.findById(params.id)
      if (!category) {
        return response.status(404).json({ message: 'Không tìm thấy danh mục' })
      }

      category.isActive = !category.isActive
      await category.save()

      return response.json({ message: 'Đã cập nhật trạng thái danh mục', category })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi khi cập nhật danh mục',
        error: error.message,
      })
    }
  }

  /**
   * Get brands list with pagination
   */
  async getBrands({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))
      const skip = (page - 1) * limit

      const [brands, total] = await Promise.all([
        Brand.find().skip(skip).limit(limit).lean(),
        Brand.countDocuments(),
      ])

      // Add product count for each brand
      const brandsWithCount = await Promise.all(
        brands.map(async (brand: any) => {
          const productCount = await Product.countDocuments({
            brand: brand.name,
          })
          return { ...brand, productCount }
        })
      )

      return response.json({
        brands: brandsWithCount,
        page,
        totalPages: Math.ceil(total / limit),
        total,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi khi lấy thương hiệu',
        error: error.message,
      })
    }
  }

  /**
   * Toggle brand active status
   */
  async toggleBrandActive({ params, response }: HttpContext) {
    try {
      const brand = await Brand.findById(params.id)
      if (!brand) {
        return response.status(404).json({ message: 'Không tìm thấy thương hiệu' })
      }

      brand.isActive = !brand.isActive
      await brand.save()

      return response.json({ message: 'Đã cập nhật trạng thái thương hiệu', brand })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi khi cập nhật thương hiệu',
        error: error.message,
      })
    }
  }

  /**
   * Get system settings
   */
  async getSettings({ response }: HttpContext) {
    try {
      let settings = await Settings.findOne()

      // Create default settings if not exists
      if (!settings) {
        settings = await Settings.create({
          siteName: 'ShoeStore',
          siteDescription: '',
          contactEmail: '',
          contactPhone: '',
        })
      }

      return response.json(settings)
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi khi lấy cài đặt',
        error: error.message,
      })
    }
  }

  /**
   * Update system settings
   */
  async updateSettings({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'siteName',
        'siteDescription',
        'siteLogo',
        'contactEmail',
        'contactPhone',
        'address',
        'maintenanceMode',
        'maintenanceMessage',
        'emailNotifications',
        'orderConfirmationEmail',
        'emailFromName',
        'emailFromAddress',
        'minOrderAmount',
        'maxOrderAmount',
        'freeShippingThreshold',
        'defaultShippingFee',
        'codEnabled',
        'bankTransferEnabled',
        'defaultProductsPerPage',
        'maxProductImages',
        'allowGuestReviews',
        'requireReviewApproval',
        'facebookUrl',
        'instagramUrl',
        'twitterUrl',
        'youtubeUrl',
        'metaTitle',
        'metaDescription',
        'metaKeywords',
        'googleAnalyticsId',
        'facebookPixelId',
      ])

      let settings = await Settings.findOne()

      if (!settings) {
        settings = await Settings.create(data)
      } else {
        Object.assign(settings, data)
        await settings.save()
      }

      return response.json({ message: 'Đã cập nhật cài đặt', settings })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi khi cập nhật cài đặt',
        error: error.message,
      })
    }
  }

  /**
   * Get partner orders (for Partner Dashboard)
   */
  async getPartnerOrders({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const partnerId = new mongoose.Types.ObjectId(user.id)

      const page = Number.parseInt(request.input('page', '1'))
      const limit = Number.parseInt(request.input('limit', '10'))
      const status = request.input('status')
      const skip = (page - 1) * limit

      // Build query - get orders that contain items from this partner
      const matchQuery: any = {
        'items.seller': partnerId,
      }

      if (status && status !== 'all') {
        matchQuery.status = status
      }

      const [orders, totalOrders] = await Promise.all([
        Order.find(matchQuery).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Order.countDocuments(matchQuery),
      ])

      // Filter items to show only partner's items
      const filteredOrders = orders.map((order: any) => ({
        ...order,
        items: order.items.filter((item: any) => item.seller.toString() === partnerId.toString()),
      }))

      return response.json({
        orders: filteredOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi khi lấy đơn hàng',
        error: error.message,
      })
    }
  }
}
