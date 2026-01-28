/**
 * Role Authorization Middleware
 * Check if user has required role(s) to access a route
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { ResponseHelper } from '#utils/response'
import { USER_ROLES, type UserRole } from '#utils/constants'
import { logger } from '#utils/logger'

export default class RoleMiddleware {
  /**
   * Check if user has any of the required roles
   */
  async handle({ request, response }: HttpContext, next: NextFn, options: { roles: UserRole[] }) {
    const user = (request as any).user

    if (!user) {
      logger.warn('RoleMiddleware: No user found in request')
      return ResponseHelper.unauthorized(response)
    }

    const hasRole = options.roles.includes(user.role as UserRole)

    if (!hasRole) {
      logger.warn('RoleMiddleware: Access denied', {
        userId: user.id,
        userRole: user.role,
        requiredRoles: options.roles,
      })
      return ResponseHelper.forbidden(
        response,
        `Chỉ ${options.roles.join(', ')} mới có quyền truy cập`
      )
    }

    await next()
  }
}

/**
 * Helper functions to create role-specific middleware
 */

export function adminOnly() {
  return async ({ request, response }: HttpContext, next: NextFn) => {
    const user = (request as any).user
    if (!user || user.role !== USER_ROLES.ADMIN) {
      return ResponseHelper.forbidden(response, 'Chỉ admin mới có quyền truy cập')
    }
    await next()
  }
}

export function partnerOnly() {
  return async ({ request, response }: HttpContext, next: NextFn) => {
    const user = (request as any).user
    if (!user || user.role !== USER_ROLES.PARTNER) {
      return ResponseHelper.forbidden(response, 'Chỉ partner mới có quyền truy cập')
    }
    await next()
  }
}

export function adminOrPartner() {
  return async ({ request, response }: HttpContext, next: NextFn) => {
    const user = (request as any).user
    if (!user || ![USER_ROLES.ADMIN, USER_ROLES.PARTNER].includes(user.role)) {
      return ResponseHelper.forbidden(response, 'Chỉ admin hoặc partner mới có quyền truy cập')
    }
    await next()
  }
}

export function userOnly() {
  return async ({ request, response }: HttpContext, next: NextFn) => {
    const user = (request as any).user
    if (!user || user.role !== USER_ROLES.USER) {
      return ResponseHelper.forbidden(response, 'Chỉ user mới có quyền truy cập')
    }
    await next()
  }
}

export function notAdmin() {
  return async ({ request, response }: HttpContext, next: NextFn) => {
    const user = (request as any).user
    if (user && user.role === USER_ROLES.ADMIN) {
      return ResponseHelper.forbidden(response, 'Admin không có quyền truy cập chức năng này')
    }
    await next()
  }
}
