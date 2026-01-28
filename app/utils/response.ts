/**
 * Standardized API Response Utility
 * Provides consistent response format across all endpoints
 */

import type { HttpContext } from '@adonisjs/core/http'
import { HTTP_STATUS } from './constants.js'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: {
    message: string
    code?: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export class ResponseHelper {
  /**
   * Send success response
   */
  static success<T>(
    response: HttpContext['response'],
    data?: T,
    message?: string,
    statusCode: number = HTTP_STATUS.OK
  ): void {
    response.status(statusCode).json({
      success: true,
      message,
      data,
    } as ApiResponse<T>)
  }

  /**
   * Send created response
   */
  static created<T>(
    response: HttpContext['response'],
    data?: T,
    message: string = 'Tạo thành công'
  ): void {
    this.success(response, data, message, HTTP_STATUS.CREATED)
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    response: HttpContext['response'],
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): void {
    response.status(HTTP_STATUS.OK).json({
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as ApiResponse<T[]>)
  }

  /**
   * Send error response
   */
  static error(
    response: HttpContext['response'],
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: any,
    code?: string
  ): void {
    response.status(statusCode).json({
      success: false,
      error: {
        message,
        code,
        details,
      },
    } as ApiResponse)
  }

  /**
   * Send bad request error
   */
  static badRequest(response: HttpContext['response'], message: string, details?: any): void {
    this.error(response, message, HTTP_STATUS.BAD_REQUEST, details, 'BAD_REQUEST')
  }

  /**
   * Send unauthorized error
   */
  static unauthorized(
    response: HttpContext['response'],
    message: string = 'Vui lòng đăng nhập'
  ): void {
    this.error(response, message, HTTP_STATUS.UNAUTHORIZED, undefined, 'UNAUTHORIZED')
  }

  /**
   * Send forbidden error
   */
  static forbidden(
    response: HttpContext['response'],
    message: string = 'Bạn không có quyền truy cập'
  ): void {
    this.error(response, message, HTTP_STATUS.FORBIDDEN, undefined, 'FORBIDDEN')
  }

  /**
   * Send not found error
   */
  static notFound(response: HttpContext['response'], message: string = 'Không tìm thấy'): void {
    this.error(response, message, HTTP_STATUS.NOT_FOUND, undefined, 'NOT_FOUND')
  }

  /**
   * Send validation error
   */
  static validationError(response: HttpContext['response'], errors: any): void {
    this.error(
      response,
      'Dữ liệu không hợp lệ',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      errors,
      'VALIDATION_ERROR'
    )
  }

  /**
   * Send server error
   */
  static serverError(
    response: HttpContext['response'],
    message: string = 'Lỗi server',
    error?: any
  ): void {
    this.error(response, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, error, 'INTERNAL_ERROR')
  }
}
