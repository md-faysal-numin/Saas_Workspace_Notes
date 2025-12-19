import Note from '#models/note'
import Workspace from '#models/workspace'
import { WorkspaceService } from '#services/workspace_service'
import { updateWorkspaceValidator } from '#validators/update_workspace'
import { workspaceValidator } from '#validators/workspace'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class WorkspacesController {
  constructor(protected workspaceService: WorkspaceService) {}
  // List all workspaces in the user's company
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!

    try {
      let filters = request.qs()

      const workspaces = await this.workspaceService.getAllWorkspaces(user.companyId, filters)

      return workspaces
    } catch (error) {
      return response.internalServerError({ error: error.message })
    }
  }

  // Create new workspace
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const validator = workspaceValidator(user.companyId)
    const data = await request.validateUsing(validator)

    try {
      const workspace = await this.workspaceService.createWorkspace(
        user.id,
        user.role,
        user.companyId,
        data
      )
      return response.created(workspace)
    } catch (error) {
      return response.badRequest({ error: error.message })
    }
  }

  // Get single workspace
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    try {
      const workspace = await this.workspaceService.getWorkspace(user.companyId, Number(params.id))
      return response.ok(workspace)
    } catch (error) {
      if (error.message.includes('Access denied')) {
        return response.forbidden({ error: error.message })
      }
      return response.notFound({ error: 'Workspace not found' })
    }
  }

  // Update workspace
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    try {
      let workspace = await this.workspaceService.getWorkspace(user.companyId, Number(params.id))
      const workspaceId = params.id
      const companyId = user.companyId
      const data = await request.validateUsing(updateWorkspaceValidator, {
        meta: { workspaceId, companyId },
      })
      workspace = await this.workspaceService.updateWorkspace(workspace, user.role, data)

      return workspace
    } catch (error) {
      if (error.message.includes('Access denied')) {
        return response.forbidden({ error: error.message })
      }
      return response.badRequest({ error: error.message })
    }
  }

  // Delete workspace
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    try {
      await this.workspaceService.deleteWorkspace(user.companyId, user.role, Number(params.id))
      return response.noContent()
    } catch (error) {
      if (error.message.includes('Access denied')) {
        return response.forbidden({ error: error.message })
      }
      return response.badRequest({ error: error.message })
    }
  }
}
