import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CorsMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    // Allow requests from React frontend
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://web2-laptop-marketplace-gules.vercel.app',
    ]

    const origin = request.header('Origin')
    if (origin && allowedOrigins.includes(origin)) {
      response.header('Access-Control-Allow-Origin', origin)
    }

    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-Anonymous-Id, X-Anonymous-Name'
    )
    response.header('Access-Control-Allow-Credentials', 'true')

    // Handle preflight requests
    if (request.method() === 'OPTIONS') {
      return response.status(200).send('')
    }

    await next()
  }
}
