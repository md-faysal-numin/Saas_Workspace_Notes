import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'workspaces'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('company_id').unsigned().references('companies.id').onDelete('CASCADE')
      table.integer('created_by').unsigned().references('users.id').onDelete('SET NULL')
      table.string('name', 255).notNullable()
      table.string('slug', 255).notNullable()
      table.text('description').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['company_id'])
      table.index(['created_by'])
      table.unique(['company_id', 'slug'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
