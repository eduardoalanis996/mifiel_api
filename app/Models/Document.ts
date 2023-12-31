import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Document extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public mifielDocumentId: string

  @column()
  public name: string

  @column()
  public originalFileName: string

  @column()
  public signedFileName: string

  @column()
  public encode: string

  @column()
  public isSigned: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
