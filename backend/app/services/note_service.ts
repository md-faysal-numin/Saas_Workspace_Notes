import Note from '#models/note'
import User from '#models/user'
import Workspace from '#models/workspace'
import NoteVote from '#models/note_vote'

import Database from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

type NoteFilters = {
  page: number
  limit: number
  search: string
  status: 'all' | 'draft' | 'published'
  workspaceId: number
}

export class NoteService {
  private async getAllUserIds(companyId: number) {
    const companyUserIds = (await User.query().where('companyId', companyId).select('id')).map(
      (user) => user.id
    )

    return companyUserIds
  }

  private applyPublicStatusFilter(
    query: any,
    userId: number,
    companyUserIds: number[],
    status: 'all' | 'draft' | 'published'
  ) {
    if (status === 'draft') {
      // Show ONLY user's drafts
      query.where('createdBy', userId).where('status', 'draft')
    } else if (status === 'published') {
      // Show ONLY published notes from company
      query.whereIn('createdBy', companyUserIds).where('status', 'published')
    } else {
      // Show both (default behavior)
      query.where((builder: any) => {
        builder
          .where((subBuilder: any) => {
            subBuilder.whereIn('createdBy', companyUserIds).where('status', 'published')
          })
          .orWhere((subBuilder: any) => {
            subBuilder.where('createdBy', userId).where('status', 'draft')
          })
      })
    }
  }

  private applySearchFilter(query: any, search: string) {
    if (search) {
      query.whereILike('title', `%${search}%`)
    }
  }

  private applyPrivateStatusFilter(query: any, status: 'all' | 'draft' | 'published') {
    if (status === 'draft') {
      // console.log('aisi')
      // Show ONLY user's drafts
      query.where('status', 'draft')
    } else if (status === 'published') {
      // Show ONLY published notes from company
      query.where('status', 'published')
    }
  }

  private verifyUpdatePermission(note: Note, userId: number, userRole: string) {
    // Admin can update any public note
    if (userRole === 'admin' && note.type === 'public') {
      return
    }

    // Private notes can only be updated by creator
    if (note.type === 'private' && note.createdBy !== userId) {
      throw new Error('Only note creator can update private notes')
    }

    // Public notes can be updated by creator or admin
    if (note.createdBy !== userId && userRole !== 'admin') {
      throw new Error('Only note creator or admin can update')
    }
  }

  private verifyNoteAccess(userId: number, companyId: number, note: Note) {
    if (note.workspace.companyId !== companyId) {
      throw new Error('Access denied')
    }

    if (note.createdBy !== userId && note.type === 'private') {
      throw new Error('Access denied')
    }
  }
  private async verifyWorksspaceOwnership(workspaceId: number, companyId: number) {
    const workspace = await Workspace.query()
      .where('id', workspaceId)
      .where('companyId', companyId)
      .first()

    if (!workspace) {
      throw new Error('Workspace not found or Access Denied')
    }
    return workspace
  }
  private verifyDeletePermission(note: Note, userId: number, userRole: string) {
    // Admin can delete any public note
    if (userRole === 'admin' && note.type === 'public') {
      return
    }

    // Private notes can only be deleted by creator
    if (note.type === 'private' && note.createdBy !== userId) {
      throw new Error('Only note creator can delete private notes')
    }

    // Public notes can be deleted by creator or admin
    if (note.createdBy !== userId && userRole !== 'admin') {
      throw new Error('Only note creator or admin can delete')
    }
  }
  async getPublicNotes(userId: number, companyId: number, filters: Partial<NoteFilters>) {
    let { page = 1, limit = 20, search = '', status = 'all', workspaceId = 0 } = filters

    const companyUserIds = await this.getAllUserIds(companyId)
    const query = Note.query()
      .where('type', 'public')
      .preload('workspace')
      .preload('creator', (qs) => qs.select('id', 'fullName'))
      .preload('tags')
      .orderBy('createdAt', 'desc')

    this.applyPublicStatusFilter(query, userId, companyUserIds, status)
    this.applySearchFilter(query, search)

    if (Number(workspaceId)) {
      query.where('workspaceId', workspaceId)
    }

    // const notes = await query.paginate(page, Math.max(limit, 20))
    const notes = await query
      .leftJoin('note_votes as uv', (join) => {
        join.on('uv.note_id', '=', 'notes.id').andOnVal('uv.user_id', userId)
      })
      .select('notes.*')
      .select('uv.vote_type as userVote')
      .paginate(page, Math.min(limit, 20))

    // console.log(notes)
    return notes
  }

  async getPrivateNotes(userId: number, filters: Partial<NoteFilters>) {
    let { page = 1, limit = 20, search = '', status = 'all', workspaceId = 0 } = filters

    const query = Note.query()
      .where('createdBy', userId)
      .where('type', 'private')
      .preload('workspace')
      .preload('tags')
      .orderBy('updatedAt', 'desc')

    this.applyPrivateStatusFilter(query, status)
    this.applySearchFilter(query, search)

    if (Number(workspaceId)) {
      query.where('workspaceId', workspaceId)
    }

    const notes = await query.paginate(page, Math.max(limit, 20))
    return notes
  }

  async createNote(userId: number, companyId: number, data: any) {
    const { title, content, type, status, tagIds, workspaceId } = data
    // Verify workspace belongs to user's company

    await this.verifyWorksspaceOwnership(workspaceId, companyId)
    const note = await Note.create({
      workspaceId,
      createdBy: userId,
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

    return note
  }

  async getNote(userId: number, companyId: number, noteId: number) {
    const note = await Note.query().where('id', noteId).preload('workspace').firstOrFail()

    this.verifyNoteAccess(userId, companyId, note)
    return note
  }

  async updateNote(userId: number, userRole: string, companyId: number, noteId: number, data: any) {
    const note = await Note.query().where('id', noteId).preload('workspace').firstOrFail()

    if (note.workspace.companyId !== companyId) {
      throw new Error('Access denied')
    }

    await this.verifyUpdatePermission(note, userId, userRole)
    // Security: Must be from same company

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

  async deleteNote(userId: number, userRole: string, companyId: number, noteId: number) {
    const note = await Note.query().where('id', noteId).preload('workspace').firstOrFail()

    if (note.workspace.companyId !== companyId) {
      throw new Error('Access denied')
    }
    await this.verifyDeletePermission(note, userId, userRole)
    await note.delete()
  }

  async getNoteHistories(userId: number, userRole: string, companyId: number, noteId: number) {
    const note = await Note.query().where('id', noteId).preload('workspace').firstOrFail()

    // Security checks
    if (note.workspace.companyId !== companyId) {
      throw new Error('Access denied')
    }

    if (note.createdBy !== userId && userRole !== 'admin') {
      throw new Error('Access denied')
    }

    if (note.type === 'private' && note.createdBy !== userId) {
      throw new Error('Access denied')
    }

    const histories = await note
      .related('histories')
      .query()
      .preload('user', (q) => q.select('id', 'fullName'))
      .orderBy('createdAt', 'desc')

    return histories
  }

  async restoreFromHistory(
    userId: number,
    userRole: string,
    companyId: number,
    noteId: number,
    historyId: number
  ) {
    const note = await Note.query().where('id', noteId).preload('workspace').firstOrFail()

    // Security: Must be from same company
    if (note.workspace.companyId !== companyId) {
      throw new Error('Access denied')
    }
    // Security: Must be creator
    if (note.createdBy !== userId && userRole !== 'admin') {
      throw new Error('Only note creator can restore')
    }

    if (note.createdBy !== userId && note.type === 'private') {
      throw new Error('Only note creator can restore')
    }

    const history = await note.related('histories').query().where('id', historyId).firstOrFail()

    note.title = history.title
    note.content = history.content
    await note.save()

    await note.load('tags')
    await note.load('workspace')
    return note
  }
  async getNoteVotes(
    userId: number,
    companyId: number,
    noteId: number,
    voteType: 'upvote' | 'downvote'
  ) {
    const note = await Note.query().where('id', noteId).preload('workspace').firstOrFail()

    // Security: Must be from same company
    if (note.workspace.companyId !== companyId) {
      throw new Error('Access denied')
    }

    // Can only vote on public notes
    if (note.type !== 'public') {
      throw new Error('Access denied')
    }

    const existingVote = await NoteVote.query()
      .where('noteId', note.id)
      .where('userId', userId)
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
        user_id: userId,
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
    return note
  }
}
