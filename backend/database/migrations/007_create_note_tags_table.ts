import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'note_tags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('note_id').unsigned().references('notes.id').onDelete('CASCADE')
      table.integer('tag_id').unsigned().references('tags.id').onDelete('CASCADE')
      table.timestamp('created_at').notNullable()

      table.unique(['note_id', 'tag_id'])
      table.index(['note_id'])
      table.index(['tag_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
