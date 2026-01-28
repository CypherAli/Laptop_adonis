# 🚀 QUICK REFERENCE - Refactored Code Patterns

## 📦 Imports Chuẩn

```typescript
// Controller imports
import type { HttpContext } from '@adonisjs/core/http'
import { ResponseHelper } from '#utils/response'
import { logger } from '#utils/logger'
import { USER_ROLES, ERROR_MESSAGES } from '#utils/constants'
import { YourService } from '#services/your_service'

// Service imports
import { logger } from '#utils/logger'
import { ERROR_MESSAGES } from '#utils/constants'
import { YourModel } from '#models/your_model'
```

## 🎯 Controller Pattern (Thin Controllers)

```typescript
export default class YourController {
  async methodName({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      
      // 1. Validation & Authorization
      if (user.role === USER_ROLES.ADMIN) {
        return ResponseHelper.forbidden(response, ERROR_MESSAGES.ADMIN_NO_CART)
      }

      // 2. Extract data
      const { param1, param2 } = request.only(['param1', 'param2'])

      // 3. Call service
      const result = await YourService.operation({ param1, param2 })

      // 4. Log success
      logger.info('Operation successful', { userId: user.id, param1 })

      // 5. Return response
      return ResponseHelper.success(response, result, 'Success message')
    } catch (error) {
      // 6. Log & handle error
      logger.error('Operation failed', error, { userId: user.id })
      return ResponseHelper.badRequest(response, error.message)
    }
  }
}
```

## 🔧 Service Pattern (Business Logic)

```typescript
export class YourService {
  static async operation({ param1, param2 }: InputInterface) {
    try {
      // 1. Validate inputs
      if (!param1) {
        throw new Error(ERROR_MESSAGES.INVALID_INPUT)
      }

      // 2. Perform business logic
      const data = await YourModel.findOne({ param1 })
      
      if (!data) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND)
      }

      // 3. Process & update
      const result = await data.save()

      // 4. Log
      logger.info('Service operation completed', { param1 })

      // 5. Return result (không return response)
      return result
    } catch (error) {
      logger.error('Service operation failed', error, { param1 })
      throw error // Throw để controller handle
    }
  }
}
```

## ✅ Response Helpers

```typescript
// Success
ResponseHelper.success(response, data, 'Message')              // 200
ResponseHelper.created(response, data, 'Created')              // 201

// Paginated
ResponseHelper.paginated(response, items, page, limit, total) // 200 + meta

// Errors
ResponseHelper.badRequest(response, 'Invalid data')           // 400
ResponseHelper.unauthorized(response)                          // 401
ResponseHelper.forbidden(response, 'No access')                // 403
ResponseHelper.notFound(response, 'Not found')                 // 404
ResponseHelper.validationError(response, errors)               // 422
ResponseHelper.serverError(response, 'Server error')           // 500
```

## 📝 Logger Usage

```typescript
// Info
logger.info('User logged in', { userId, timestamp })

// Warning
logger.warn('Low stock', { productId, stock: 5 })

// Error (with error object)
logger.error('Payment failed', error, { orderId, amount })

// Debug (development only)
logger.debug('Cache hit', { key, value })

// HTTP logging
logger.request('POST', '/api/cart', userId)
logger.response('POST', '/api/cart', 200, 45) // 45ms

// Performance
logger.performance('Database query', 150, { collection: 'products' })
```

## 🎭 Constants Usage

```typescript
// Roles
if (user.role === USER_ROLES.ADMIN) { ... }
if (user.role === USER_ROLES.PARTNER) { ... }
if (user.role === USER_ROLES.USER) { ... }

// Status
order.status = ORDER_STATUS.CONFIRMED
payment.status = PAYMENT_STATUS.PAID

// Messages
throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND)
throw new Error(ERROR_MESSAGES.INSUFFICIENT_STOCK)
throw new Error(ERROR_MESSAGES.UNAUTHORIZED)

// HTTP
return response.status(HTTP_STATUS.OK).json(...)
return response.status(HTTP_STATUS.BAD_REQUEST).json(...)

// Pagination
const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = request.qs()
```

## 🔐 Validation Helpers

```typescript
import { ValidationHelper } from '#utils/validation'

// Validate required fields
const missing = ValidationHelper.validateRequired(data, ['name', 'email', 'password'])
if (missing.length) {
  return ResponseHelper.badRequest(response, `Thiếu: ${missing.join(', ')}`)
}

// Validate email
if (!ValidationHelper.isValidEmail(email)) {
  return ResponseHelper.badRequest(response, 'Email không hợp lệ')
}

// Validate ObjectId
if (!ValidationHelper.isValidObjectId(productId)) {
  return ResponseHelper.badRequest(response, 'ID không hợp lệ')
}

// Sanitize pagination
const { page, limit } = ValidationHelper.sanitizePagination(
  request.qs().page,
  request.qs().limit
)

// Validate price/quantity
if (!ValidationHelper.isValidPrice(price)) { ... }
if (!ValidationHelper.isValidQuantity(quantity)) { ... }
```

## 🔍 Query Helpers

```typescript
import { QueryHelper } from '#utils/query_helper'

// Build search filter
const searchFilter = QueryHelper.buildSearchFilter(search, ['name', 'description'])

// Build price filter
const priceFilter = QueryHelper.buildPriceFilter(minPrice, maxPrice)

// Build array filter
const brands = QueryHelper.buildArrayFilter(request.qs().brand) // 'Nike,Adidas' -> ['Nike', 'Adidas']

// Build sort
const sort = QueryHelper.buildSort(sortBy, sortOrder, { createdAt: -1 })

// Pagination
const { skip, limit } = QueryHelper.getPaginationParams(page, limit)
```

## ⚙️ Environment Config

```typescript
import { EnvConfig } from '#utils/env_config'

// App config
const port = EnvConfig.app.port
const nodeEnv = EnvConfig.app.nodeEnv

// Database
const mongoUri = EnvConfig.database.mongoUri

// JWT
const jwtSecret = EnvConfig.jwt.secret
const expiresIn = EnvConfig.jwt.expiresIn

// Features
if (EnvConfig.features.reviews) {
  // Enable reviews
}

// Helpers
if (EnvConfig.isProduction) { ... }
if (EnvConfig.isDevelopment) { ... }
```

## 🛡️ Middleware Usage

```typescript
import { adminOnly, notAdmin, adminOrPartner } from '#middleware/role_middleware'

// In routes
router.get('/admin/users', [AdminController, 'getUsers']).use(adminOnly())
router.post('/cart', [CartsController, 'addItem']).use(notAdmin())
router.post('/products', [ProductsController, 'store']).use(adminOrPartner())
```

## 🎨 Complete Example

```typescript
// ==================== CONTROLLER ====================
import type { HttpContext } from '@adonisjs/core/http'
import { ResponseHelper } from '#utils/response'
import { logger } from '#utils/logger'
import { USER_ROLES, ERROR_MESSAGES } from '#utils/constants'
import { ProductService } from '#services/product_service'
import { ValidationHelper } from '#utils/validation'

export default class ProductsController {
  async index({ request, response }: HttpContext) {
    try {
      const { search, minPrice, maxPrice, page, limit } = request.qs()
      
      // Sanitize pagination
      const pagination = ValidationHelper.sanitizePagination(page, limit)
      
      // Call service
      const { products, total } = await ProductService.getAll({
        search,
        minPrice,
        maxPrice,
        ...pagination,
      })
      
      // Log
      logger.info('Products fetched', { count: products.length })
      
      // Return paginated response
      return ResponseHelper.paginated(
        response,
        products,
        pagination.page,
        pagination.limit,
        total
      )
    } catch (error) {
      logger.error('Get products error', error)
      return ResponseHelper.serverError(response)
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      
      // Authorization
      if (![USER_ROLES.ADMIN, USER_ROLES.PARTNER].includes(user.role)) {
        return ResponseHelper.forbidden(response)
      }
      
      // Validate
      const data = request.only(['name', 'price', 'description'])
      const missing = ValidationHelper.validateRequired(data, ['name', 'price'])
      
      if (missing.length) {
        return ResponseHelper.badRequest(response, `Thiếu: ${missing.join(', ')}`)
      }
      
      // Create
      const product = await ProductService.create({ ...data, createdBy: user.id })
      
      // Log
      logger.info('Product created', { productId: product._id, userId: user.id })
      
      // Return
      return ResponseHelper.created(response, product, 'Sản phẩm đã được tạo')
    } catch (error) {
      logger.error('Create product error', error, { userId: user.id })
      return ResponseHelper.badRequest(response, error.message)
    }
  }
}

// ==================== SERVICE ====================
import { Product } from '#models/product'
import { logger } from '#utils/logger'
import { ERROR_MESSAGES } from '#utils/constants'
import { QueryHelper } from '#utils/query_helper'

export class ProductService {
  static async getAll({ search, minPrice, maxPrice, page, limit }) {
    try {
      // Build filters
      const filters = []
      
      if (search) {
        filters.push(QueryHelper.buildSearchFilter(search, ['name', 'description']))
      }
      
      if (minPrice || maxPrice) {
        const priceFilter = QueryHelper.buildPriceFilter(minPrice, maxPrice)
        if (Object.keys(priceFilter).length) {
          filters.push({ price: priceFilter })
        }
      }
      
      const filter = QueryHelper.buildCompoundFilter(filters)
      
      // Get pagination params
      const { skip, limit: pageLimit } = QueryHelper.getPaginationParams(page, limit)
      
      // Query
      const [products, total] = await Promise.all([
        Product.find(filter).skip(skip).limit(pageLimit).lean(),
        Product.countDocuments(filter),
      ])
      
      logger.debug('Products queried', { filter, count: products.length })
      
      return { products, total }
    } catch (error) {
      logger.error('Get products service error', error)
      throw error
    }
  }
  
  static async create(data) {
    try {
      const product = await Product.create(data)
      logger.info('Product created in service', { productId: product._id })
      return product
    } catch (error) {
      logger.error('Create product service error', error)
      throw error
    }
  }
}
```

---

## ✅ Checklist Khi Refactor Controller

- [ ] Import ResponseHelper, logger, constants
- [ ] Thay console.log/error bằng logger
- [ ] Thay magic strings bằng constants
- [ ] Sử dụng ResponseHelper cho responses
- [ ] Tách business logic ra service
- [ ] Validation đầu vào
- [ ] Error handling với try/catch
- [ ] Logging cho important operations
- [ ] Type safety (avoid `any` where possible)

---

**📚 Full Guide:** [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md)  
**✅ Completion Report:** [REFACTORING_COMPLETION.md](./REFACTORING_COMPLETION.md)
