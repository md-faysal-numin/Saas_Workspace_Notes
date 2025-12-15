import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Note from './note.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @manyToMany(() => Note, {
    pivotTable: 'note_tags',
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false }
  })
  declare notes: ManyToMany<typeof Note>
}