import { DateTime } from 'luxon'
import { BaseModel, column,  hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import SignatoryDocument from './SignatoryDocument'

export default class Signatory extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public rfc: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => SignatoryDocument)
  public signatoryDocuments: HasMany<typeof SignatoryDocument>

}
