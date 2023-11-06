import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SignatoryDocument from 'App/Models/SignatoryDocument'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import MiFielService from 'App/Services/MiFielService'
import Application from '@ioc:Adonis/Core/Application'
import HashService from 'App/Services/HashService'
import Database from '@ioc:Adonis/Lucid/Database'
import Signatory from 'App/Models/Signatory'
import Document from 'App/Models/Document'
import * as crypto from 'crypto';
import fs from 'fs'
import Mail from '@ioc:Adonis/Addons/Mail'
import SignatoryDocument from 'App/Models/SignatoryDocument'


const MIFIEL_DOCUMENT_FILE_NAME = 'sample.pdf'

//AAA020101AAA

export default class DocumentsController {

    private DEFAULT_SIGNATORY
    private MIFIEL_DOCUMENT

    constructor() {
        this.DEFAULT_SIGNATORY = {
            email: 'eduardoalanis996@gmail.com',
            rfc: 'AAMJ960310TRA',
            name: 'Jesus Eduardo Alanis Mendez'
        }
        this.MIFIEL_DOCUMENT = `Contrato ${this.generateRandomToken(6)}`
    }

    public async store({ request, response }: HttpContextContract) {

        const signatorySchema = schema.create({
            signatories: schema.array().members(
                schema.object().members({
                    name: schema.string(),
                    email: schema.string([
                        rules.email()
                    ]),
                    rfc: schema.string(),
                })
            )
        })

        const payload = await request.validate({ schema: signatorySchema })

        const trx = await Database.beginGlobalTransaction()

        try {

            const fileContent = fs.readFileSync(`${Application.appRoot}/storage/${MIFIEL_DOCUMENT_FILE_NAME}`)

            const base64Content = Buffer.from(fileContent).toString('base64');

            const hashContent = HashService.calculateHash(fileContent)

            const signatoriesToMifiel = payload.signatories.filter((s) => s.rfc != this.DEFAULT_SIGNATORY.rfc).concat(this.DEFAULT_SIGNATORY)

            const mifielDocumentResponse = await MiFielService.createDocument(hashContent, this.MIFIEL_DOCUMENT, signatoriesToMifiel)

            const signatories = await Signatory.fetchOrCreateMany('rfc', signatoriesToMifiel, trx)

            const document = await Document.create({
                mifielDocumentId: mifielDocumentResponse.id, name: this.MIFIEL_DOCUMENT,
                originalFileName: MIFIEL_DOCUMENT_FILE_NAME, encode: base64Content
            }, trx)

            const SignatoryDocumentData = signatories.map((signer) => {
                return {
                    signatoryId: signer.id, documentId: document.id, token: (signer.rfc != this.DEFAULT_SIGNATORY.rfc) ? this.generateRandomToken(32) : null,
                    widgetId: (mifielDocumentResponse.signers.find((s) => s.email == signer.email && s.tax_id == signer.rfc))?.widget_id
                }
            })

            // await Mail.sendLater((message) => {
            //     message.htmlView('emails/signature_client', {
            //       name:'Jhon Doe',
            //       widgetId:'BH4kkeZoJJ'
            //     })
            //     message.to('eduardoalanis996@gmail.com')
            //     message.subject('Contrato de compra venta')
            //     message.from('noreply.mifiel@gmail.com')
            //   })

            await SignatoryDocument.createMany(SignatoryDocumentData, trx)

            trx.commit()

            response.status(200).json({ message: 'OK', code: 'OK', status: 200 })

        } catch (e) {
            console.log(e)
            trx.rollback()
            throw new Error(e)
        }

    }

    public async index({ response }: HttpContextContract) {

        const signatory = await Signatory.findBy('rfc', this.DEFAULT_SIGNATORY.rfc)

        if (!signatory) {
            return response.status(200).json([])
        }

        const sygnatoryDocument = await SignatoryDocument.query()
            .where('signatoryId', signatory?.id).preload('documents', (docQuery) => {
                docQuery.select('id', 'name', 'is_signed', 'created_at')
            })


        const documentIds = sygnatoryDocument.map((item) => item.documents.id)

        const signatories = await Document.query()
            .select('documents.id', 'signatories.email', 'signatory_documents.is_signed')
            .whereIn('documents.id', documentIds)
            .innerJoin('signatory_documents', 'documents.id', 'signatory_documents.document_id')
            .innerJoin('signatories', 'signatory_documents.signatory_id', 'signatories.id')

        const responseData = sygnatoryDocument.map((item) => {
            const itemToJSON = item.toJSON()
            return {
                ...itemToJSON,
                signatories: signatories.map((s) => {
                    if (s.id == item.documents.id) {
                        return {
                            ...s.toJSON(),
                            ...s.$extras
                        }
                    }
                }).filter((x) => x != null)
            }
        })

        return response.status(200).json(responseData)
    }

    public async callback({ request }: HttpContextContract) {
        const payload = request.body()

        const document = await Document.findBy('mifiel_document_id', payload.document)

        const signatory = await Signatory.findBy('rfc', payload.signer.tax_id)


        const signatoryDocument = await SignatoryDocument.query().where({ signatory_id: signatory?.id, document_id: document?.id }).first()

        if (signatoryDocument) {
            await SignatoryDocument.query().update('is_signed', true).where('id', signatoryDocument?.id)
        }

    }

    private generateRandomToken(length: number): string {
        const randomBytes = crypto.randomBytes(length);
        const token = randomBytes.toString('hex');
        return token;
    }



}
