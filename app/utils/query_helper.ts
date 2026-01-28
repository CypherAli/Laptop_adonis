/**
 * Common Query Helpers
 * Reusable query building and filtering utilities
 */

import { SORT_ORDER } from './constants.js'

export interface QueryFilter {
  search?: string
  minPrice?: number
  maxPrice?: number
  brand?: string | string[]
  category?: string
  inStock?: boolean
  sortBy?: string
  sortOrder?: string
  [key: string]: any
}

export class QueryHelper {
  /**
   * Build search filter for text search
   */
  static buildSearchFilter(search: string, fields: string[]): any {
    if (!search) return {}

    return {
      $or: fields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      })),
    }
  }

  /**
   * Build price range filter
   */
  static buildPriceFilter(minPrice?: number, maxPrice?: number): any {
    if (!minPrice && !maxPrice) return {}

    const priceCondition: any = {}
    if (minPrice) priceCondition.$gte = Number(minPrice)
    if (maxPrice) priceCondition.$lte = Number(maxPrice)

    return priceCondition
  }

  /**
   * Build array filter (e.g., brands, sizes, colors)
   */
  static buildArrayFilter(value: string | string[] | undefined): string[] | null {
    if (!value) return null

    const values = Array.isArray(value) ? value : value.split(',')
    return values.map((v) => v.trim()).filter((v) => v)
  }

  /**
   * Build sort object
   */
  static buildSort(sortBy?: string, sortOrder?: string, defaultSort: any = { createdAt: -1 }): any {
    if (!sortBy) return defaultSort

    const order =
      sortOrder === SORT_ORDER.ASC || sortOrder === SORT_ORDER.ASCENDING
        ? 1
        : sortOrder === SORT_ORDER.DESC || sortOrder === SORT_ORDER.DESCENDING
          ? -1
          : -1

    return { [sortBy]: order }
  }

  /**
   * Calculate skip and limit for pagination
   */
  static getPaginationParams(page: number, limit: number): { skip: number; limit: number } {
    return {
      skip: (page - 1) * limit,
      limit,
    }
  }

  /**
   * Build date range filter
   */
  static buildDateRangeFilter(startDate?: Date | string, endDate?: Date | string): any {
    if (!startDate && !endDate) return {}

    const dateCondition: any = {}
    if (startDate) dateCondition.$gte = new Date(startDate)
    if (endDate) dateCondition.$lte = new Date(endDate)

    return dateCondition
  }

  /**
   * Build compound filter with AND conditions
   */
  static buildCompoundFilter(conditions: any[]): any {
    const validConditions = conditions.filter(
      (condition) => condition && Object.keys(condition).length > 0
    )

    if (validConditions.length === 0) return {}
    if (validConditions.length === 1) return validConditions[0]

    return { $and: validConditions }
  }

  /**
   * Parse comma-separated IDs
   */
  static parseIds(ids: string | string[] | undefined): string[] | null {
    if (!ids) return null
    return this.buildArrayFilter(ids)
  }

  /**
   * Build text search with multiple fields and weights
   */
  static buildWeightedTextSearch(search: string, fieldWeights: Record<string, number>): any {
    if (!search) return {}

    const conditions = Object.entries(fieldWeights).map(([field, weight]) => ({
      [field]: { $regex: search, $options: 'i' },
      $meta: { score: weight },
    }))

    return { $or: conditions }
  }
}
