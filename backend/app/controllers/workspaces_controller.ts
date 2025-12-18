import Note from '#models/note'
import Workspace from '#models/workspace'
import { updateWorkspaceValidator } from '#validators/update_workspace'
import { workspaceValidator } from '#validators/workspace'
import type { HttpContext } from '@adonisjs/core/http'

export default class WorkspacesController {
  // List all workspaces in the user's company
  async index({ auth, request }: HttpContext) {
    const user = auth.user!
    let { page = 1, limit = 20 } = request.qs()
    limit = Math.min(limit, 20)

    const workspaces = await Workspace.query()
      .where('companyId', user.companyId)
      .preload('creator', (query) => query.select('id', 'fullName'))
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return workspaces
  }

  // Create new workspace
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const validator = workspaceValidator(user.companyId)
    const data = await request.validateUsing(validator)

    if (user.role !== 'admin') {
      return response.forbidden({ error: 'Only workspace creator can update' })
    }

    const workspace = await Workspace.create({
      ...data,
      companyId: user.companyId,
      createdBy: user.id,
    })

    await workspace.load('creator')
    return response.created(workspace)
  }

  // Get single workspace with its public notes
  async show({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const workspace = await Workspace.query()
      .where('id', params.id)
      .where('companyId', user.companyId) // Security: Only same company
      .preload('creator')
      .firstOrFail()

    if (workspace.companyId !== user.companyId) {
      return response.forbidden({ error: 'Access denied' })
    }
    // Get public notes in this workspace created by company users
    let { page = 1, limit = 20 } = request.qs()
    limit = Math.min(limit, 20)

    const notes = await Note.query()
      .where('workspaceId', workspace.id)
      .where('type', 'public')
      .where('status', 'published')
      .preload('creator', (query) => query.select('id', 'fullName'))
      .preload('tags')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return {
      workspace,
      notes,
    }
  }

  // Update workspace
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const workspace = await Workspace.query()
      .where('id', params.id)
      .where('companyId', user.companyId)
      .firstOrFail()
    if (workspace.companyId !== user.companyId) {
      return response.forbidden({ error: 'Access denied' })
    }
    // Only admin can update
    if (user.role !== 'admin') {
      return response.forbidden({ error: 'Only workspace creator can update' })
    }
    const workspaceId = params.id
    const companyId = user.companyId
    const data = await request.validateUsing(updateWorkspaceValidator, {
      meta: { workspaceId, companyId },
    })
    workspace.merge(data)
    await workspace.save()

    return workspace
  }

  // Delete workspace
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const workspace = await Workspace.query()
      .where('id', params.id)
      .where('companyId', user.companyId)
      .firstOrFail()

    if (workspace.companyId !== user.companyId) {
      return response.forbidden({ error: 'Access denied' })
    }

    // Only creator can delete
    if (user.role !== 'admin') {
      return response.forbidden({ error: 'Only workspace creator can delete' })
    }

    await workspace.delete()
    return response.noContent()
  }
}
