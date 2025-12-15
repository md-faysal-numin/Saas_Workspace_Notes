import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'note_votes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('note_id').unsigned().references('notes.id').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.enum('vote_type', ['upvote', 'downvote']).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['note_id', 'user_id'])
      table.index(['note_id'])
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
