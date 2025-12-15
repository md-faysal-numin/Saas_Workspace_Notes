import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Note from './note.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class NoteVote extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare noteId: number

  @column()
  declare userId: number

  @column()
  declare voteType: 'upvote' | 'downvote'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Note)
  declare note: BelongsTo<typeof Note>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
