import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'
import env from '#start/env'

export default class JwtAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx

    try {
      // Get token from header
      const authHeader = request.header('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({
          message: 'Token không hợp lệ hoặc không tồn tại',
        })
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix

      // SECURITY: Get JWT_SECRET without fallback - fail if not configured
      const jwtSecret = env.get('JWT_SECRET')
      if (!jwtSecret) {
        console.error('JWT_SECRET is not configured!')
        return response.status(500).json({
          message: 'Lỗi cấu hình server',
        })
      }

      // Verify token
      const decoded = jwt.verify(token, jwtSecret)

      // Attach user to both request and auth for compatibility
      ;(request as any).user = decoded
      ;(ctx as any).auth = { user: decoded }

      await next()
    } catch (error) {
      return response.status(401).json({
        message: 'Token không hợp lệ hoặc đã hết hạn',
      })
    }
  }
}
