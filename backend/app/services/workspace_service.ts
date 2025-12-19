import Note from '#models/note'
import Workspace from '#models/workspace'

interface WorkspaceFilters {
  page: number
  limit: number
}
export class WorkspaceService {
  // Your code here

  async getAllWorkspaces(companyId: number, filters: Partial<WorkspaceFilters>) {
    let { page = 1, limit = 20 } = filters
    limit = Math.min(limit, 20)

    const workspaces = await Workspace.query()
      .where('companyId', companyId)
      .preload('creator', (query) => query.select('id', 'fullName'))
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return workspaces
  }

  async getWorkspace(companyId: number, workspaceId: number) {
    const workspace = await Workspace.query()
      .where('id', workspaceId)
      .where('companyId', companyId) // Security: Only same company
      .preload('creator')
      .firstOrFail()

    if (workspace.companyId !== companyId) {
      throw new Error('Access denied')
    }

    return workspace
  }

  async createWorkspace(userId: number, userRole: string, companyId: number, data: any) {
    if (userRole !== 'admin') {
      throw new Error('Only workspace creator can update')
    }

    const workspace = await Workspace.create({
      ...data,
      companyId: companyId,
      createdBy: userId,
    })

    await workspace.load('creator')

    return workspace
  }

  async updateWorkspace(workspace: Workspace, userRole: string, data: any) {
    // Only admin can update
    if (userRole !== 'admin') {
      throw new Error('Only workspace creator can update')
    }

    workspace.merge(data)
    await workspace.save()

    return workspace
  }

  async deleteWorkspace(companyId: number, userRole: string, workspaceId: number) {
    const workspace = await Workspace.query()
      .where('id', workspaceId)
      .where('companyId', companyId)
      .firstOrFail()

    if (workspace.companyId !== companyId) {
      throw new Error('Access denied')
    }

    // Only creator can delete
    if (userRole !== 'admin') {
      throw new Error('Only workspace creator can delete')
    }

    await workspace.delete()
  }
}
