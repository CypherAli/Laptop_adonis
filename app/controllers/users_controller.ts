import type { HttpContext } from '@adonisjs/core/http'
import { User } from '#models/user'

export default class UsersController {
  /**
   * Get user addresses
   */
  async getAddresses({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id

      const user = await User.findById(userId).select('addresses')
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      return response.json({
        addresses: user.addresses || [],
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Add new address
   */
  async addAddress({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const addressData = request.only(['label', 'fullName', 'phone', 'address', 'isDefault'])

      const user = await User.findById(userId)
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      // If this is set as default, unset other defaults
      if (addressData.isDefault) {
        user.addresses?.forEach((addr: any) => {
          addr.isDefault = false
        })
      }

      // Add new address
      if (!user.addresses) {
        user.addresses = []
      }

      user.addresses.push({
        ...addressData,
        createdAt: new Date(),
      })

      await user.save()

      return response.status(201).json({
        message: 'Thêm địa chỉ thành công',
        address: user.addresses[user.addresses.length - 1],
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Update address
   */
  async updateAddress({ request, response, params }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { addressId } = params
      const addressData = request.only(['label', 'fullName', 'phone', 'address', 'isDefault'])

      const user = await User.findById(userId)
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      const addressIndex = user.addresses?.findIndex(
        (addr: any) => addr._id.toString() === addressId
      )

      if (addressIndex === -1 || addressIndex === undefined) {
        return response.status(404).json({
          message: 'Địa chỉ không tồn tại',
        })
      }

      // If this is set as default, unset other defaults
      if (addressData.isDefault) {
        user.addresses?.forEach((addr: any) => {
          addr.isDefault = false
        })
      }

      // Update address
      Object.assign(user.addresses![addressIndex], addressData)
      await user.save()

      return response.json({
        message: 'Cập nhật địa chỉ thành công',
        address: user.addresses![addressIndex],
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Delete address
   */
  async deleteAddress({ request, response, params }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { addressId } = params

      const user = await User.findById(userId)
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      const addressIndex = user.addresses?.findIndex(
        (addr: any) => addr._id.toString() === addressId
      )

      if (addressIndex === -1 || addressIndex === undefined) {
        return response.status(404).json({
          message: 'Địa chỉ không tồn tại',
        })
      }

      // Remove address
      user.addresses!.splice(addressIndex, 1)
      await user.save()

      return response.json({
        message: 'Xóa địa chỉ thành công',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Set default address
   */
  async setDefaultAddress({ request, response, params }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { addressId } = params

      const user = await User.findById(userId)
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      const addressIndex = user.addresses?.findIndex(
        (addr: any) => addr._id.toString() === addressId
      )

      if (addressIndex === -1 || addressIndex === undefined) {
        return response.status(404).json({
          message: 'Địa chỉ không tồn tại',
        })
      }

      // Unset all defaults
      user.addresses?.forEach((addr: any) => {
        addr.isDefault = false
      })

      // Set this as default
      user.addresses![addressIndex].isDefault = true
      await user.save()

      return response.json({
        message: 'Đã đặt làm địa chỉ mặc định',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id

      const user = await User.findById(userId).select('paymentMethods')
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      return response.json({
        paymentMethods: user.paymentMethods || [],
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const paymentData = request.only([
        'type',
        'provider',
        'lastFourDigits',
        'accountName',
        'expiryDate',
        'isDefault',
      ])

      const user = await User.findById(userId)
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      // If this is set as default, unset other defaults
      if (paymentData.isDefault) {
        user.paymentMethods?.forEach((method: any) => {
          method.isDefault = false
        })
      }

      // Add new payment method
      if (!user.paymentMethods) {
        user.paymentMethods = []
      }

      user.paymentMethods.push(paymentData)
      await user.save()

      return response.status(201).json({
        message: 'Thêm phương thức thanh toán thành công',
        paymentMethod: user.paymentMethods[user.paymentMethods.length - 1],
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod({ request, response, params }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const { methodId } = params

      const user = await User.findById(userId)
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      const methodIndex = user.paymentMethods?.findIndex(
        (method: any) => method._id.toString() === methodId
      )

      if (methodIndex === -1 || methodIndex === undefined) {
        return response.status(404).json({
          message: 'Phương thức thanh toán không tồn tại',
        })
      }

      // Remove payment method
      user.paymentMethods!.splice(methodIndex, 1)
      await user.save()

      return response.json({
        message: 'Xóa phương thức thanh toán thành công',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id

      const user = await User.findById(userId).select('preferences')
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      return response.json({
        preferences: user.preferences || {},
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user.id
      const preferencesData = request.only(['notifications', 'language', 'currency'])

      const user = await User.findById(userId)
      if (!user) {
        return response.status(404).json({
          message: 'Người dùng không tồn tại',
        })
      }

      // Update preferences
      user.preferences = {
        ...user.preferences,
        ...preferencesData,
      }

      await user.save()

      return response.json({
        message: 'Cập nhật cài đặt thành công',
        preferences: user.preferences,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }
}
