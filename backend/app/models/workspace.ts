import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Company from './company.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Note from './note.js'
import User from './user.js'

export default class Workspace extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare companyId: number
  @column()
  declare createdBy: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => Note)
  declare notes: HasMany<typeof Note>
}
