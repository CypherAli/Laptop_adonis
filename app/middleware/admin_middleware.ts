import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const user = (request as any).user

    if (!user || user.role !== 'admin') {
      return response.status(403).json({
        message: 'Bạn không có quyền truy cập. Chỉ Admin mới được phép.',
      })
    }

    await next()
  }
}
