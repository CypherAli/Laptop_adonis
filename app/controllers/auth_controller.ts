import type { HttpContext } from '@adonisjs/core/http'
import { User } from '#models/user'
import { Order } from '#models/order'
import { Review } from '#models/review'
import jwt from 'jsonwebtoken'
import env from '#start/env'

export default class AuthController {
  /**
   * Register a new user
   */
  async register({ request, response }: HttpContext) {
    try {
      const { username, email, password, role, shopName } = request.only([
        'username',
        'email',
        'password',
        'role',
        'shopName',
      ])

      // Validation
      if (!username || !email || !password) {
        return response.status(400).json({
          message: 'Tên, email và mật khẩu là bắt buộc',
        })
      }

      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      })

      if (existingUser) {
        return response.status(400).json({
          message: 'Email hoặc tên người dùng đã tồn tại',
        })
      }

      // Prepare user data
      const userData: any = {
        username,
        email,
        password,
        role: role || 'client',
      }

      // Partner-specific validation
      if (role === 'partner') {
        if (!shopName) {
          return response.status(400).json({
            message: 'Tên cửa hàng là bắt buộc',
          })
        }
        userData.shopName = shopName
        userData.isApproved = false
      }

      // Create user
      const user = new User(userData)
      await user.save()

      return response.status(201).json({
        message: 'Đăng ký thành công!',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
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
   * Login user
   */
  async login({ request, response }: HttpContext) {
    try {
      // Debug: Log raw request
      console.log('📨 Request body:', request.body())
      console.log('📨 Request all:', request.all())
      
      const { email, password } = request.only(['email', 'password'])

      console.log('📧 Login attempt:', { email, passwordProvided: !!password })

      // Validation
      if (!email || !password) {
        console.log('❌ Missing email or password')
        return response.status(400).json({
          message: 'Email và mật khẩu là bắt buộc',
        })
      }

      // Find user
      console.log('🔍 Finding user with email:', email)
      const user = await User.findOne({ email })
      if (!user) {
        console.log('❌ User not found')
        return response.status(400).json({
          message: 'Email hoặc mật khẩu không đúng',
        })
      }
      console.log('✅ User found:', { id: user._id, username: user.username, isActive: user.isActive })

      // Check if account is active
      if (!user.isActive) {
        console.log('❌ Account is not active')
        return response.status(403).json({
          message: 'Tài khoản đã bị khóa',
        })
      }

      // Compare password
      console.log('🔐 Comparing password...')
      const isMatch = await user.comparePassword(password)
      console.log('🔐 Password match result:', isMatch)
      if (!isMatch) {
        console.log('❌ Password does not match')
        return response.status(400).json({
          message: 'Email hoặc mật khẩu không đúng',
        })
      }
      console.log('✅ Password matched, generating token...')

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          username: user.username,
          email: user.email,
          isApproved: user.isApproved || true,
        },
        env.get('JWT_SECRET', 'your-secret-key'),
        { expiresIn: '24h' }
      )

      // Prepare response
      const responseData: any = {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          shopName: user.shopName,
          avatar: user.avatar,
          isApproved: user.isApproved,
        },
        message: 'Đăng nhập thành công!',
      }

      // Redirect URL based on role
      if (user.role === 'admin') {
        responseData.redirectUrl = '/admin'
      } else if (user.role === 'partner') {
        responseData.redirectUrl = '/manager'
      }

      // Add warning if partner not approved
      if (user.role === 'partner' && !user.isApproved) {
        responseData.warning =
          'Tài khoản Partner đang chờ phê duyệt. Một số tính năng có thể bị giới hạn.'
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      return response.json(responseData)
    } catch (error) {
      console.error('Login error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get current user profile
   */
  async me({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id

      const user = await User.findById(userId).select('-password')
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      // Get user stats
      const orders = await Order.find({ user: userId })
      const reviews = await Review.find({ user: userId })

      const stats = {
        totalOrders: orders.length,
        totalSpent: orders
          .filter((o: any) => o.status !== 'cancelled')
          .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
        totalReviews: reviews.length,
      }

      return response.json({
        user,
        stats,
        loyaltyPoints: user.loyaltyPoints || { available: 0, total: 0, used: 0 },
        addresses: user.addresses || [],
        paymentMethods: user.paymentMethods || [],
        preferences: user.preferences || {},
        verification: {
          email: user.verification?.email?.isVerified || false,
          phone: user.verification?.phone?.isVerified || false,
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
   * Update user profile
   */
  async updateProfile({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { username, email, phone, shopName, currentPassword, newPassword } = request.only([
        'username',
        'email',
        'phone',
        'shopName',
        'currentPassword',
        'newPassword',
      ])

      const user = await User.findById(userId)
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      // Update basic fields
      if (username) user.username = username
      if (email) user.email = email
      if (phone) user.phone = phone
      if (shopName && user.role === 'partner') user.shopName = shopName

      // Password update
      if (currentPassword && newPassword) {
        const isMatch = await user.comparePassword(currentPassword)
        if (!isMatch) {
          return response.status(400).json({
            message: 'Mật khẩu hiện tại không đúng',
          })
        }
        user.password = newPassword
      }

      await user.save()

      return response.json({
        message: 'Cập nhật thông tin thành công',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          shopName: user.shopName,
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
   * Logout user (client-side token removal)
   */
  async logout({ response }: HttpContext) {
    return response.json({
      message: 'Đăng xuất thành công',
    })
  }
}
