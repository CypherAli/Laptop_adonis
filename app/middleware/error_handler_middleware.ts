/**
 * Global Error Handler Middleware
 * Catches and formats errors consistently
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { ResponseHelper } from '#utils/response'
import { logger } from '#utils/logger'

export default class ErrorHandlerMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    try {
      await next()
    } catch (error) {
      this.handleError(error, request, response)
    }
  }

  private handleError(
    error: any,
    request: HttpContext['request'],
    response: HttpContext['response']
  ) {
    // Log error
    logger.error('Request error', error, {
      method: request.method(),
      url: request.url(),
      userId: (request as any).user?.id,
    })

    // Validation errors (VineJS)
    if (error.messages) {
      return ResponseHelper.validationError(response, error.messages)
    }

    // MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return ResponseHelper.badRequest(response, `${field} đã tồn tại`)
    }

    // MongoDB cast error (invalid ObjectId)
    if (error.name === 'CastError') {
      return ResponseHelper.badRequest(response, 'ID không hợp lệ')
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      return ResponseHelper.unauthorized(response, 'Token không hợp lệ')
    }

    if (error.name === 'TokenExpiredError') {
      return ResponseHelper.unauthorized(response, 'Token đã hết hạn')
    }

    // Custom error with status code
    if (error.status) {
      return ResponseHelper.error(
        response,
        error.message || 'Đã có lỗi xảy ra',
        error.status,
        error.details
      )
    }

    // Default server error
    return ResponseHelper.serverError(
      response,
      'Lỗi server',
      process.env.NODE_ENV === 'development' ? error.message : undefined
    )
  }
}
