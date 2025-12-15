import Note from '#models/note'
import User from '#models/user'
import Workspace from '#models/workspace'
import Database from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { noteValidator } from '#validators/note'
import NoteVote from '#models/note_vote'

export default class NotesController {
  // Get all PUBLIC notes created by users in MY company
  async publicNotes({ auth, request }: HttpContext) {
    const user = auth.user!

    let { page = 1, limit = 20, search = '', status = 'all', workspaceId = 0 } = request.qs()
    limit = Math.max(limit, 20)
    // const workspaceId = request.input('workspaceId') // Optional filter

    // Get all user IDs from my company
    const companyUserIds = (
      await User.query().where('company_id', user.companyId).select('id')
    ).map((user) => user.id)

    const query = Note.query()
      .where('type', 'public')
      .preload('workspace')
      .preload('creator')
      .preload('tags')
      .orderBy('createdAt', 'desc')

    // Status filtering
    if (status === 'draft') {
      // Show ONLY user's drafts
      query.where('createdBy', user.id).where('status', 'draft')
    } else if (status === 'published') {
      // Show ONLY published notes from company
      query.whereIn('createdBy', companyUserIds).where('status', 'published')
    } else {
      // Show both (default behavior)
      query.where((builder) => {
        builder
          .where((subBuilder) => {
            subBuilder.whereIn('createdBy', companyUserIds).where('status', 'published')
          })
          .orWhere((subBuilder) => {
            subBuilder.where('createdBy', user.id).where('status', 'draft')
          })
      })
    }

    if (search) {
      query.whereILike('title', `%${search}%`)
    }

    if (Number(workspaceId)) {
      query.where('workspaceId', workspaceId)
    }

    const notes = await query.paginate(page, limit)
    return notes
  }

  // Get all PRIVATE notes created by current user
  async privateNotes({ auth, request }: HttpContext) {
    const user = auth.user!
    let { page = 1, limit = 1, search = '', status = 'all', workspaceId } = request.qs()
    limit = Math.max(limit, 20)
    // const workspaceId = request.input('workspaceId') // Optional filter

    const query = Note.query()
      .where('createdBy', user.id)
      .where('type', 'private')
      .preload('workspace')
      .preload('tags')
      .orderBy('updatedAt', 'desc')
    // console.log(status)
    if (status === 'draft') {
      // console.log('aisi')
      // Show ONLY user's drafts
      query.where('status', 'draft')
    } else if (status === 'published') {
      // Show ONLY published notes from company
      query.where('status', 'published')
    }

    if (search) {
      query.where('title', 'ILIKE', `%${search}%`)
    }

    if (workspaceId) {
      query.where('workspaceId', workspaceId)
    }

    const notes = await query.paginate(page, limit)
    return notes
  }

  // Get single note (with access control)
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const note = await Note.query()
      .where('id', params.id)
      .preload('workspace')
      .preload('tags')
      .preload('creator', (q) => q.select('id', 'fullName'))
      .firstOrFail()

    // Access control
    const workspace = note.workspace

    // Must be from same company
    if (workspace.companyId !== user.companyId) {
      return response.forbidden({ error: 'Access denied' })
    }

    // If private, must be the creator
    if (note.type === 'private' && note.createdBy !== user.id) {
      return response.forbidden({ error: 'Access denied' })
    }

    return note
  }

  // Create note
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(noteValidator)

    const { title, content, type, status, tagIds, workspaceId } = data
    // Verify workspace belongs to user's company
    await Workspace.query()
      .where('id', workspaceId)
      .where('companyId', user.companyId)
      .firstOrFail()

    const note = await Note.create({
      workspaceId,
      createdBy: user.id,
      title,
      content,
      type: type || 'private',
      status: status || 'draft',
      publishedAt: status === 'published' ? DateTime.now() : null,
    })

    if (tagIds && tagIds.length > 0) {
      await note.related('tags').attach(tagIds)
    }

    await note.load('tags')
    await note.load('workspace')
    await note.load('creator')

    return response.created(note)
  }

  // Update note
  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const note = await Note.query().where('id', params.id).preload('workspace').firstOrFail()

    if (note.workspace.companyId !== user.companyId) {
      return response.forbidden({ error: 'Access denied' })
    }
    // Security: Must be creator
    if (note.createdBy !== user.id && user.role !== 'admin') {
      return response.forbidden({ error: 'Only note creator can update' })
    }
    if (note.createdBy !== user.id  && note.type === 'private') {
      return response.forbidden({ error: 'Only note creator can update' })
    }

    // Security: Must be from same company

    request.all().workspaceId = note.workspaceId

    const data = await request.validateUsing(noteValidator)

    const { title, content, type, status, tagIds } = data

    note.merge({
      title: title || note.title,
      content: content || note.content,
      type: type || note.type,
      status: status || note.status,
    })

    // Set published date if changing from draft to published
    if (status === 'published' && note.$original.status === 'draft') {
      note.publishedAt = DateTime.now()
    }

    await note.save()

    // Update tags
    if (tagIds) {
      await note.related('tags').sync(tagIds)
    }

    await note.load('tags')
    await note.load('workspace')
    await note.load('creator', (q) => q.select('id', 'fullName'))

    return note
  }

  // Delete note
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const note = await Note.query().where('id', params.id).preload('workspace').firstOrFail()

    // Security: Must be from same company
    if (note.workspace.companyId !== user.companyId) {
      return response.forbidden({ error: 'Access denied' })
    }
    // Security: Must be creator
    if (note.createdBy !== user.id && user.role !== 'admin') {
      return response.forbidden({ error: 'Only note creator can delete' })
    }

    if (note.createdBy !== user.id && note.type === 'private') {
      return response.forbidden({ error: 'Only note creator can delete' })
    }

    await note.delete()
    return response.noContent()
  }

  // Get note histories
  async histories({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const note = await Note.query().where('id', params.id).preload('workspace').firstOrFail()

    // Security checks
    if (note.workspace.companyId !== user.companyId) {
      return response.forbidden({ error: 'Access denied' })
    }

    if (note.createdBy !== user.id && user.role !== 'admin') {
      return response.forbidden({ error: 'Access denied' })
    }

    if (note.type === 'private' && note.createdBy !== user.id) {
      return response.forbidden({ error: 'Access denied' })
    }

    const histories = await note
      .related('histories')
      .query()
      .preload('user', (q) => q.select('id', 'fullName'))
      .orderBy('createdAt', 'desc')

    return histories
  }

  // Restore from history
  async restore({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const note = await Note.query().where('id', params.id).preload('workspace').firstOrFail()

    const { historyId } = request.only(['historyId'])

    // Security: Must be from same company
    if (note.workspace.companyId !== user.companyId) {
      return response.forbidden({ error: 'Access denied' })
    }
    // Security: Must be creator
    if (note.createdBy !== user.id && user.role !== 'admin') {
      return response.forbidden({ error: 'Only note creator can restore' })
    }

    if (note.createdBy !== user.id && note.type === 'private') {
      return response.forbidden({ error: 'Only note creator can restore' })
    }

    const history = await note.related('histories').query().where('id', historyId).firstOrFail()

    note.title = history.title
    note.content = history.content
    await note.save()

    await note.load('tags')
    await note.load('workspace')
    return note
  }

  // Vote on note (only on public notes)
  async vote({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const note = await Note.query().where('id', params.id).preload('workspace').firstOrFail()

    const { voteType } = request.only(['voteType'])

    // Security: Must be from same company
    if (note.workspace.companyId !== user.companyId) {
      return response.forbidden({ error: 'Access denied' })
    }

    // Can only vote on public notes
    if (note.type !== 'public') {
      return response.forbidden({ error: 'Can only vote on public notes' })
    }

    const existingVote = await NoteVote.query()
      .where('noteId', note.id)
      .where('userId', user.id)
      .first()

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        await Database.from('note_votes').where('id', existingVote.id).delete()

        if (voteType === 'upvote') {
          note.upvotesCount -= 1
        } else {
          note.downvotesCount -= 1
        }
      } else {
        // Switch vote
        await Database.from('note_votes')
          .where('id', existingVote.id)
          .update({ vote_type: voteType, updated_at: new Date() })

        if (voteType === 'upvote') {
          note.upvotesCount += 1
          note.downvotesCount -= 1
        } else {
          note.downvotesCount += 1
          note.upvotesCount -= 1
        }
      }
    } else {
      // New vote
      await Database.table('note_votes').insert({
        note_id: note.id,
        user_id: user.id,
        vote_type: voteType,
        created_at: new Date(),
        updated_at: new Date(),
      })

      if (voteType === 'upvote') {
        note.upvotesCount += 1
      } else {
        note.downvotesCount += 1
      }
    }

    await note.save()
    return response.ok(note)
  }
}
