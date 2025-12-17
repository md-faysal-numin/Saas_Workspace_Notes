import type { HttpContext } from '@adonisjs/core/http'
import { noteValidator } from '#validators/note'
import { inject } from '@adonisjs/core'
import { NoteService } from '#services/note_service'
@inject()
export default class NotesController {
  constructor(protected noteService: NoteService) {}
  // Get all PUBLIC notes created by users in MY company
  async publicNotes({ auth, request }: HttpContext) {
    const user = auth.user!

    const filters = request.qs()

    const notes = this.noteService.getPublicNotes(user.id, user.companyId, filters)
    return notes
  }

  // Get all PRIVATE notes created by current user
  async privateNotes({ auth, request }: HttpContext) {
    const user = auth.user!
    const filters = request.qs()
    const notes = await this.noteService.getPrivateNotes(user.id, filters)
    return notes
  }

  // Get single note (with access control)
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    try {
      const note = await this.noteService.getNote(user.id, user.companyId, Number(params.id))

      return response.ok(note)
    } catch (error) {
      if (error.message.includes('Access denied')) {
        return response.forbidden({ error: error.message })
      }
      return response.notFound({ error: 'Note not found' })
    }
  }

  // Create note
  async store({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const data = await request.validateUsing(noteValidator)

      const note = await this.noteService.createNote(user.id, user.companyId, data)

      return response.created(note)
    } catch (error) {
      return response.badRequest({ message: error.message })
    }
  }

  // Update note
  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    try {
      const note = await this.noteService.getNote(user.id, user.companyId, Number(params.id))

      request.all().workspaceId = note.workspaceId

      const data = await request.validateUsing(noteValidator)

      const { workspaceId, ...data1 } = data

      const updatedNote = await this.noteService.updateNote(
        user.id,
        user.role,
        user.companyId,
        params.id,
        data1
      )

      return updatedNote
    } catch (error) {
      if (error.message.includes('Access denied')) {
        return response.forbidden({ error: error.message })
      }
      return response.badRequest({ error: error.message })
    }
  }

  // Delete note
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      await this.noteService.deleteNote(user.id, user.role, user.companyId, Number(params.id))

      return response.noContent()
    } catch (error) {
      if (error.message.includes('Access denied')) {
        return response.forbidden({ error: error.message })
      }
      return response.badRequest({ error: error.message })
    }
  }

  // Get note histories
  async histories({ auth, params, response }: HttpContext) {
    const user = auth.user!
    try {
      const histories = await this.noteService.getNoteHistories(
        user.id,
        user.role,
        user.companyId,
        Number(params.id)
      )

      return histories
    } catch (error) {
      if (error.message.includes('Access denied')) {
        return response.forbidden({ error: error.message })
      }
      return response.badRequest({ error: error.message })
    }
  }

  // Restore from history
  async restore({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    try {
      const { historyId } = request.only(['historyId'])

      const note = await this.noteService.restoreFromHistory(
        user.id,
        user.role,
        user.companyId,
        Number(params.id),
        historyId
      )
      return response.ok(note)
    } catch (error) {
      if (error.message.includes('Access denied')) {
        return response.forbidden({ error: error.message })
      }
      return response.badRequest({ error: error.message })
    }
  }

  // Vote on note (only on public notes)
  async vote({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    try {
      const { voteType } = request.only(['voteType'])
      const note = await this.noteService.getNoteVotes(
        user.id,
        user.companyId,
        Number(params.id),
        voteType
      )
      return response.ok(note)
    } catch (error) {
      if (error.message.includes('Access denied')) {
        return response.forbidden({ error: error.message })
      }
      return response.badRequest({ error: error.message })
    }
  }
}
