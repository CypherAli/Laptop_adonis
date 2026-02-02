/**
 * Common Validation Helpers
 * Reusable validation utilities
 */

import { REGEX, PAGINATION } from './constants.js'
import type { ObjectId } from 'mongoose'
import mongoose from 'mongoose'

export class ValidationHelper {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    return REGEX.EMAIL.test(email)
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone: string): boolean {
    return REGEX.PHONE.test(phone)
  }

  /**
   * Validate slug format
   */
  static isValidSlug(slug: string): boolean {
    return REGEX.SLUG.test(slug)
  }

  /**
   * Validate username format
   */
  static isValidUsername(username: string): boolean {
    return REGEX.USERNAME.test(username)
  }

  /**
   * Validate MongoDB ObjectId
   */
  static isValidObjectId(id: string | ObjectId): boolean {
    return mongoose.Types.ObjectId.isValid(id.toString())
  }

  /**
   * Validate and sanitize pagination params
   */
  static sanitizePagination(page?: any, limit?: any): { page: number; limit: number } {
    const sanitizedPage = Math.max(1, Number.parseInt(page) || PAGINATION.DEFAULT_PAGE)
    const sanitizedLimit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, Number.parseInt(limit) || PAGINATION.DEFAULT_LIMIT)
    )

    return {
      page: sanitizedPage,
      limit: sanitizedLimit,
    }
  }

  /**
   * Validate required fields
   */
  static validateRequired(data: Record<string, any>, fields: string[]): string[] {
    const missing: string[] = []
    for (const field of fields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missing.push(field)
      }
    }
    return missing
  }

  /**
   * Validate price
   */
  static isValidPrice(price: any): boolean {
    const num = Number(price)
    return !Number.isNaN(num) && num >= 0
  }

  /**
   * Validate quantity
   */
  static isValidQuantity(quantity: any): boolean {
    const num = Number(quantity)
    return Number.isInteger(num) && num > 0
  }

  /**
   * Validate rating (1-5)
   */
  static isValidRating(rating: any): boolean {
    const num = Number(rating)
    return Number.isInteger(num) && num >= 1 && num <= 5
  }

  /**
   * Sanitize string (trim and remove extra spaces)
   */
  static sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ')
  }

  /**
   * Escape special regex characters to prevent ReDoS attacks
   * @param str - User input string
   * @returns Escaped string safe for use in RegExp
   */
  static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * Create safe regex search pattern
   * @param search - User search input
   * @param options - Regex options (default 'i' for case insensitive)
   * @returns Safe RegExp object
   */
  static createSafeSearchRegex(search: string, options: string = 'i'): RegExp {
    const escaped = this.escapeRegex(this.sanitizeString(search))
    return new RegExp(escaped, options)
  }

  /**
   * Validate URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate enum value
   */
  static isValidEnum<T extends Record<string, string>>(value: string, enumObj: T): boolean {
    return Object.values(enumObj).includes(value)
  }
}
