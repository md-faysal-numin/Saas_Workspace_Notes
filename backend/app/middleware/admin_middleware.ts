import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */

    await auth.authenticate()

    if (!auth.user || auth.user.role !== 'admin') {
      return response.forbidden({ error: 'Access denied' })
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
