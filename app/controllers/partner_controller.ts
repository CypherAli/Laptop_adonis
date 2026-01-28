import type { HttpContext } from '@adonisjs/core/http'
import { User } from '#models/user'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import fs from 'node:fs/promises'
import path from 'node:path'

export default class PartnerController {
  /**
   * GET /api/partner/settings
   * Lấy thông tin settings của partner
   */
  async getSettings({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      // Get full user details
      const userDetails = await User.findById(user.id)
      if (!userDetails) {
        return response.notFound({ message: 'User not found' })
      }

      return response.ok({
        shopName: userDetails.shopName || '',
        email: userDetails.email,
        phone: userDetails.phone || '',
        address: userDetails.address || '',
        description: userDetails.description || '',
        businessType: userDetails.businessType || 'individual',
        taxCode: userDetails.taxCode || '',
        bankAccount: userDetails.bankAccount || '',
        bankName: userDetails.bankName || '',
        avatar: userDetails.avatar || null,
        notificationSettings: userDetails.notificationSettings || {
          emailNotifications: true,
          orderNotifications: true,
          promotionNotifications: false,
          systemNotifications: true,
        },
        storeSettings: userDetails.storeSettings || {
          autoApproveOrders: false,
          minOrderAmount: 0,
          freeShippingThreshold: 0,
          workingHours: {
            start: '08:00',
            end: '22:00',
          },
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        },
      })
    } catch (error) {
      console.error('Error fetching partner settings:', error)
      return response.internalServerError({ message: 'Failed to fetch settings' })
    }
  }

  /**
   * PUT /api/partner/settings/profile
   * Cập nhật thông tin profile của partner
   */
  async updateProfile({ auth, request, response }: HttpContext) {
    try {
      console.log('=== Partner Profile Update Request ===')
      const user = auth.user!
      console.log('User ID:', user.id)

      const userDetails = await User.findById(user.id)
      if (!userDetails) {
        console.error('User not found with ID:', user.id)
        return response.notFound({ message: 'Không tìm thấy người dùng' })
      }

      // Get form data
      const shopName = request.input('shopName', userDetails.shopName)
      const email = request.input('email', userDetails.email)
      const phone = request.input('phone', userDetails.phone)
      const address = request.input('address', userDetails.address)
      const description = request.input('description', userDetails.description)
      const businessType = request.input('businessType', userDetails.businessType || 'individual')
      const taxCode = request.input('taxCode', userDetails.taxCode)
      const bankAccount = request.input('bankAccount', userDetails.bankAccount)
      const bankName = request.input('bankName', userDetails.bankName)

      // Handle avatar upload if present
      const avatar = request.file('avatar', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'gif'],
      })

      let avatarPath = userDetails.avatar

      if (avatar) {
        // Create uploads directory if not exists
        const uploadsPath = app.makePath('public/uploads/avatars')
        await fs.mkdir(uploadsPath, { recursive: true })

        // Generate unique filename
        const fileName = `${cuid()}.${avatar.extname}`
        const filePath = path.join(uploadsPath, fileName)

        // Move file
        await avatar.move(uploadsPath, {
          name: fileName,
          overwrite: true,
        })

        avatarPath = `/uploads/avatars/${fileName}`

        // Delete old avatar if exists
        if (userDetails.avatar) {
          try {
            const oldPath = app.makePath(`public${userDetails.avatar}`)
            await fs.unlink(oldPath)
          } catch (err) {
            console.log('Could not delete old avatar:', err)
          }
        }
      }

      // Update user
      userDetails.shopName = shopName
      userDetails.email = email
      userDetails.phone = phone || null
      userDetails.address = address || null
      userDetails.description = description || null
      userDetails.businessType = businessType || 'individual'
      userDetails.taxCode = taxCode || null
      userDetails.bankAccount = bankAccount || null
      userDetails.bankName = bankName || null
      userDetails.avatar = avatarPath

      await userDetails.save()

      const responseData = {
        message: 'Cập nhật thông tin thành công!',
        user: {
          id: userDetails.id,
          username: userDetails.username,
          email: userDetails.email,
          shopName: userDetails.shopName,
          phone: userDetails.phone,
          address: userDetails.address,
          description: userDetails.description,
          businessType: userDetails.businessType,
          taxCode: userDetails.taxCode,
          bankAccount: userDetails.bankAccount,
          bankName: userDetails.bankName,
          avatar: userDetails.avatar,
          role: userDetails.role,
          isApproved: userDetails.isApproved,
          isActive: userDetails.isActive,
        },
      }

      console.log('Sending response:', responseData)
      return response.ok(responseData)
    } catch (error: any) {
      console.error('=== Error updating partner profile ===')
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('Full error:', error)

      return response.badRequest({
        message: error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }

  /**
   * PUT /api/partner/settings/password
   * Đổi mật khẩu
   */
  async updatePassword({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const userDetails = await User.findById(user.id)
      if (!userDetails) {
        return response.notFound({ message: 'User not found' })
      }

      const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

      // Verify current password
      const isValidPassword = await userDetails.verifyPassword(currentPassword)
      if (!isValidPassword) {
        return response.badRequest({ message: 'Current password is incorrect' })
      }

      // Update password
      userDetails.password = newPassword
      await userDetails.save()

      return response.ok({ message: 'Password updated successfully' })
    } catch (error) {
      console.error('Error updating password:', error)
      return response.badRequest({
        message: error.message || 'Failed to update password',
      })
    }
  }

  /**
   * PUT /api/partner/settings/notifications
   * Cập nhật cài đặt thông báo
   */
  async updateNotifications({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const userDetails = await User.findById(user.id)
      if (!userDetails) {
        return response.notFound({ message: 'User not found' })
      }

      const requestBody = request.all()

      const notificationSettings = {
        emailNotifications: requestBody.emailNotifications ?? true,
        orderNotifications: requestBody.orderNotifications ?? true,
        promotionNotifications: requestBody.promotionNotifications ?? false,
        systemNotifications: requestBody.systemNotifications ?? true,
      }

      userDetails.notificationSettings = notificationSettings
      await userDetails.save()

      return response.ok({ message: 'Notification settings updated successfully' })
    } catch (error) {
      console.error('Error updating notifications:', error)
      return response.badRequest({
        message: error.message || 'Failed to update notifications',
      })
    }
  }

  /**
   * PUT /api/partner/settings/store
   * Cập nhật cài đặt cửa hàng
   */
  async updateStore({ auth, request, response }: HttpContext) {
    try {
      console.log('=== Store Settings Update Request ===')
      const user = auth.user!
      const userDetails = await User.findById(user.id)
      if (!userDetails) {
        console.error('User not found with ID:', user.id)
        return response.notFound({ message: 'Không tìm thấy người dùng' })
      }

      const requestBody = request.all()
      console.log('Request body:', requestBody)

      const storeSettings = {
        autoApproveOrders: requestBody.autoApproveOrders ?? false,
        minOrderAmount: requestBody.minOrderAmount ?? 0,
        freeShippingThreshold: requestBody.freeShippingThreshold ?? 0,
        workingHours: requestBody.workingHours ?? {
          start: '08:00',
          end: '22:00',
        },
        workingDays: requestBody.workingDays ?? [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
      }

      console.log('Store settings to save:', storeSettings)
      userDetails.storeSettings = storeSettings
      await userDetails.save()
      console.log('Store settings saved successfully')

      return response.ok({ message: 'Cập nhật cài đặt cửa hàng thành công!' })
    } catch (error: any) {
      console.error('=== Error updating store settings ===')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      return response.badRequest({
        message: error.message || 'Không thể cập nhật cài đặt cửa hàng. Vui lòng thử lại.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }
}
