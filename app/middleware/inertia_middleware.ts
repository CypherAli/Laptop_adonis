import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Inertia Middleware
 * Xử lý Inertia requests và responses
 */
export default class InertiaMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    // Set Inertia header
    ;(request as any).inertia = {
      /**
       * Render Inertia page
       */
      render: (component: string, props: Record<string, any> = {}) => {
        const isInertiaRequest = request.header('X-Inertia') === 'true'
        const page = {
          component,
          props,
          url: request.url(),
          version: '1.0', // Version cho asset cache
        }

        if (isInertiaRequest) {
          // Inertia request - trả về JSON
          response.header('X-Inertia', 'true')
          response.header('Vary', 'Accept')
          return response.json(page)
        }

        // First load - render HTML với Inertia data
        return response.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <script type="module" src="/backoffice/main.jsx"></script>
</head>
<body>
    <div id="app" data-page='${JSON.stringify(page)}'></div>
</body>
</html>
        `)
      },
    }

    await next()
  }
}
