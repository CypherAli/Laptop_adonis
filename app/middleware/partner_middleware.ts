import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware to check if user is a partner and approved
 */
export default class PartnerMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const user = (request as any).user

    // Allow both partner and admin roles
    if (!user || (user.role !== 'partner' && user.role !== 'admin')) {
      return response.status(403).json({
        message: 'Bạn không có quyền truy cập. Chỉ Partner hoặc Admin mới được phép.',
      })
    }

    // Skip approval check for admins
    if (user.role === 'partner' && !user.isApproved) {
      return response.status(403).json({
        message: 'Tài khoản Partner của bạn đang chờ phê duyệt.',
      })
    }

    await next()
  }
}
