import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  async handle({ session, response, request }: HttpContext, next: NextFn) {
    const user = session.get('user')

    if (!user) {
      console.log('❌ Auth failed - No user in session, URL:', request.url())
      session.flash('error', 'Please login to continue')
      return response.redirect().toRoute('auth.login')
    }

    // Attach user to request for controllers to use
    ;(request as any).user = user

    await next()
  }
}
