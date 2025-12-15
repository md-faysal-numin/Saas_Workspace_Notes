import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('workspace_id').unsigned().references('workspaces.id').onDelete('CASCADE')
      table.integer('created_by').unsigned().references('users.id').onDelete('CASCADE')
      table.string('title',50).notNullable()
      table.text('content').notNullable()
      table.enum('type', ['public', 'private']).defaultTo('private')
      table.enum('status', ['draft', 'published']).defaultTo('draft')
      table.integer('upvotes_count').defaultTo(0)
      table.integer('downvotes_count').defaultTo(0)
      table.timestamp('published_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['workspace_id'])
      table.index(['type', 'status'])
      table.index(['title'])
      table.index(['created_at'])
      table.index(['upvotes_count'])
      table.index(['downvotes_count'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
