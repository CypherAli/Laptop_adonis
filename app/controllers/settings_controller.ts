import type { HttpContext } from '@adonisjs/core/http'
import { Settings } from '#models/settings'

export default class SettingsController {
  /**
   * Get current settings (Admin only)
   */
  async index({ response }: HttpContext) {
    try {
      // Settings là singleton, chỉ có 1 document
      let settings = await Settings.findOne().populate('updatedBy', 'username email')

      // Nếu chưa có settings, tạo mặc định
      if (!settings) {
        settings = await Settings.create({})
      }

      return response.json(settings)
    } catch (error) {
      console.error('❌ Get settings error:', error)
      return response.status(500).json({
        message: 'Lỗi khi lấy cài đặt',
        error: error.message,
      })
    }
  }

  /**
   * Update settings (Admin only)
   */
  async update({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const updates: any = request.only([
        // Site Information
        'siteName',
        'siteDescription',
        'siteLogo',
        'contactEmail',
        'contactPhone',
        'address',

        // Maintenance
        'maintenanceMode',
        'maintenanceMessage',

        // Email
        'emailNotifications',
        'orderConfirmationEmail',
        'emailFromName',
        'emailFromAddress',

        // Orders
        'minOrderAmount',
        'maxOrderAmount',
        'freeShippingThreshold',
        'defaultShippingFee',

        // Payment
        'paymentMethods',
        'codEnabled',
        'bankTransferEnabled',

        // Products
        'defaultProductsPerPage',
        'maxProductImages',
        'allowGuestReviews',
        'requireReviewApproval',

        // Social
        'facebookUrl',
        'instagramUrl',
        'twitterUrl',
        'youtubeUrl',

        // SEO
        'metaTitle',
        'metaDescription',
        'metaKeywords',

        // Analytics
        'googleAnalyticsId',
        'facebookPixelId',
      ])

      // Thêm updatedBy
      updates.updatedBy = user.id

      // Tìm settings hiện tại hoặc tạo mới
      let settings = await Settings.findOne()

      if (settings) {
        // Update existing
        Object.assign(settings, updates)
        await settings.save()
      } else {
        // Create new
        settings = await Settings.create(updates)
      }

      settings = await Settings.findById(settings._id).populate('updatedBy', 'username email')

      return response.json({
        message: 'Cập nhật cài đặt thành công',
        settings,
      })
    } catch (error) {
      console.error('❌ Update settings error:', error)
      return response.status(500).json({
        message: 'Lỗi khi cập nhật cài đặt',
        error: error.message,
      })
    }
  }

  /**
   * Get public settings (không cần auth)
   * Chỉ trả về thông tin công khai
   */
  async getPublic({ response }: HttpContext) {
    try {
      const settings = await Settings.findOne().select(
        'siteName siteDescription siteLogo contactEmail contactPhone address facebookUrl instagramUrl twitterUrl youtubeUrl metaTitle metaDescription metaKeywords maintenanceMode maintenanceMessage'
      )

      if (!settings) {
        return response.json({
          siteName: 'Shoe Shop',
          siteDescription: 'Your trusted online shoe marketplace',
          maintenanceMode: false,
        })
      }

      return response.json(settings)
    } catch (error) {
      console.error('❌ Get public settings error:', error)
      return response.status(500).json({
        message: 'Lỗi khi lấy cài đặt công khai',
        error: error.message,
      })
    }
  }

  /**
   * Reset settings to default (Admin only)
   */
  async reset({ request, response }: HttpContext) {
    try {
      const user = (request as any).user

      await Settings.deleteMany({})
      const settings = await Settings.create({ updatedBy: user.id })

      return response.json({
        message: 'Đã reset cài đặt về mặc định',
        settings,
      })
    } catch (error) {
      console.error('❌ Reset settings error:', error)
      return response.status(500).json({
        message: 'Lỗi khi reset cài đặt',
        error: error.message,
      })
    }
  }
}
