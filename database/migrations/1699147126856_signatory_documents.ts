import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'signatory_documents'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('signatory_id').references('id').inTable('signatories')
      table.integer('document_id').references('id').inTable('documents')
      table.string('widget_id').unique()
      table.text('token')
      table.boolean('is_signed').defaultTo(false)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
