import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class SignatoryDocument extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public signatoryId: number

  @column()
  public documentId: number

  @column()
  public widgetId: string

  @column()
  public signedFileName: string

  @column()
  public token: string

  @column()
  public isSigned: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
