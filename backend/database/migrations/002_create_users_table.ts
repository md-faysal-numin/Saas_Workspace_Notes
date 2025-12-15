import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('company_id').unsigned().references('companies.id').onDelete('CASCADE')
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.string('full_name', 255).notNullable()
      table.enum('role', ['admin', 'user']).defaultTo('user')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
