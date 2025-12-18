import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeUpdate,
  belongsTo,
  column,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import Workspace from './workspace.js'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import NoteHistory from './note_history.js'
import NoteVote from './note_vote.js'
import User from './user.js'
import Tag from './tag.js'

export default class Note extends BaseModel {
  serializeExtras() {
    return {
      userVote: this.$extras.userVote,
    }
  }

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare workspaceId: number

  @column()
  declare createdBy: number

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare type: 'public' | 'private'

  @column()
  declare status: 'draft' | 'published'

  @column()
  declare upvotesCount: number

  @column()
  declare downvotesCount: number

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Workspace)
  declare workspace: BelongsTo<typeof Workspace>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @manyToMany(() => Tag, {
    pivotTable: 'note_tags',
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare tags: ManyToMany<typeof Tag>

  @hasMany(() => NoteHistory)
  declare histories: HasMany<typeof NoteHistory>

  @hasMany(() => NoteVote)
  declare votes: HasMany<typeof NoteVote>

  @beforeUpdate()
  static async createHistory(note: Note) {
    if (note.$dirty.title || note.$dirty.content) {
      const original = note.$original
      await NoteHistory.create({
        noteId: note.id,
        userId: note.createdBy,
        title: original.title,
        content: original.content,
      })
    }
  }
}
