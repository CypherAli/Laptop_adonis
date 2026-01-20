import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware to check if user is a partner and approved
 */
export default class PartnerMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const user = (request as any).user

    if (!user || user.role !== 'partner') {
      return response.status(403).json({
        message: 'Bạn không có quyền truy cập. Chỉ Partner mới được phép.',
      })
    }

    if (!user.isApproved) {
      return response.status(403).json({
        message: 'Tài khoản Partner của bạn đang chờ phê duyệt.',
      })
    }

    await next()
  }
}
