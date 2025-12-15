import Tag from '#models/tag'
import type { HttpContext } from '@adonisjs/core/http'

export default class TagsController {
  async index({ request }: HttpContext) {
    const { search = '' } = request.qs()
    const query = Tag.query()

    if (search) {
      query.where('name', 'ILIKE', `%${search}%`)
    }

    const tags = await query.orderBy('name', 'asc')
    return tags
  }

  async store({ request, response }: HttpContext) {
    const { name, slug } = request.only(['name', 'slug'])
    const tag = await Tag.create({ name, slug })
    return response.created(tag)
  }
}
