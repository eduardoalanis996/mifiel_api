import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Document from './Document'
import Signatory from './Signatory'

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
  public token: string | null

  @column()
  public isSigned: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Document)
  public documents: BelongsTo<typeof Document>

  @belongsTo(() => Signatory)
  public signatories: BelongsTo<typeof Signatory>
}
