import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SignatoryDocument from 'App/Models/SignatoryDocument'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import MiFielService from 'App/Services/MiFielService'
import Application from '@ioc:Adonis/Core/Application'
import HashService from 'App/Services/HashService'
import Database from '@ioc:Adonis/Lucid/Database'
import PdfService from 'App/Services/PdfService'
import Signatory from 'App/Models/Signatory'
import Document from 'App/Models/Document'
import * as crypto from 'crypto';
import fs from 'fs'

export default class DocumentsController {

    private DEFAULT_SIGNATORY
    private MIFIEL_DOCUMENT
    private MIFIEL_DOCUMENT_FILE_NAME

    constructor() {
        this.DEFAULT_SIGNATORY = {
            email: 'eduardoalanis996@gmail.com',
            rfc: 'AAMJ960310TRA',
            name: 'Jesus Eduardo Alanis Mendez'
        }
        this.MIFIEL_DOCUMENT = `Contrato ${this.generateRandomToken(6)}`
        this.MIFIEL_DOCUMENT_FILE_NAME =  'sample.pdf'
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

            const fileContent = fs.readFileSync(`${Application.appRoot}/storage/${this.MIFIEL_DOCUMENT_FILE_NAME}`)

            const base64Content = Buffer.from(fileContent).toString('base64');

            const hashContent = HashService.calculateHash(fileContent)

            const signatoriesToMifiel = payload.signatories.filter((s) => s.rfc != this.DEFAULT_SIGNATORY.rfc).concat(this.DEFAULT_SIGNATORY)

            const mifielDocumentResponse = await MiFielService.createDocument(hashContent, this.MIFIEL_DOCUMENT, signatoriesToMifiel)

            const signatories = await Signatory.fetchOrCreateMany(['rfc', 'email'], signatoriesToMifiel, trx)

            const document = await Document.create({
                mifielDocumentId: mifielDocumentResponse.id, name: this.MIFIEL_DOCUMENT,
                originalFileName: this.MIFIEL_DOCUMENT_FILE_NAME, encode: base64Content
            }, trx)

            const SignatoryDocumentData = signatories.map((signer) => {
                return {
                    signatoryId: signer.id, documentId: document.id, token: (signer.rfc != this.DEFAULT_SIGNATORY.rfc) ? this.generateRandomToken(32) : null,
                    widgetId: (mifielDocumentResponse.signers.find((s) => s.email == signer.email && s.tax_id == signer.rfc))?.widget_id
                }
            })

            await SignatoryDocument.createMany(SignatoryDocumentData, trx)

            trx.commit()

            response.status(200).json({ message: 'OK', code: 'OK', status: 200 })

        } catch (e) {
            console.log(e)
            trx.rollback()
            response.status(500).json({ message: e, code: 'INTERNAL_SERVER_ERROR', status: 500 })
        }

    }

    public async show({ params, response }: HttpContextContract) {
        try {
            const { widgetId } = params

            const signatoryDocument = await SignatoryDocument.findBy('widget_id', widgetId)

            if (!signatoryDocument) {
                return response.status(500).json({ message: 'The widget id doesnt exists', code: 'NOT_FOUND', status: 404 })
            }

            const document = await Document.find(signatoryDocument?.documentId)

            const responseData = { ...signatoryDocument?.toJSON(), document }

            response.status(200).json(responseData)
        } catch (e) {
            response.status(500).json({ message: e, code: 'INTERNAL_SERVER_ERROR', status: 500 })
        }
    }

    public async index({ response }: HttpContextContract) {
        try {
            const signatory = await Signatory.findBy('rfc', this.DEFAULT_SIGNATORY.rfc)

            if (!signatory) {
                return response.status(200).json([])
            }

            const sygnatoryDocument = await SignatoryDocument.query()
                .where('signatoryId', signatory?.id).preload('documents', (docQuery) => {
                    docQuery.select('id', 'name', 'is_signed', 'created_at', 'mifiel_document_id')
                })


            const documentIds = sygnatoryDocument.map((item) => item.documents.id)

            const signatories = await Document.query()
                .select('documents.id', 'signatories.email', 'signatory_documents.is_signed', 'signatory_documents.widget_id')
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
        } catch (e) {
            response.status(500).json({ message: e, code: 'INTERNAL_SERVER_ERROR', status: 500 })
        }
    }

    public async downloadContract({ response, params }: HttpContextContract) {

        const { documentId } = params

        const filePath = `${Application.appRoot}/storage/contract_signed_${documentId}.pdf`

        response.download(filePath)
    }

    public async signCallback({ request }: HttpContextContract) {
        const payload = request.body()

        const document = await Document.findBy('mifiel_document_id', payload.document)

        const signatory = await Signatory.findBy('rfc', payload.signer.tax_id)

        const signatoryDocument = await SignatoryDocument.query().where({ signatory_id: signatory?.id, document_id: document?.id }).first()

        if (signatoryDocument) {
            await SignatoryDocument.query().update('is_signed', true).where('id', signatoryDocument?.id)
        }

    }

    public async callback({ request }: HttpContextContract) {
        const payload = request.body()

        const document = await Document.findBy('mifiel_document_id', payload.id)

        if (document) {

            const signFilePath = await MiFielService.downloadSignedDocument(document.mifielDocumentId)

            const contractFilePath = `${Application.appRoot}/storage/${this.MIFIEL_DOCUMENT_FILE_NAME}`

            const contractFileName = `contract_signed_${document.mifielDocumentId}`

            await PdfService.mixFile(contractFilePath, signFilePath, contractFileName)

            await Document.query().update({ is_signed: true, signedFileName: contractFileName }).where('id', document?.id)
        }

    }

    private generateRandomToken(length: number): string {
        const randomBytes = crypto.randomBytes(length);
        const token = randomBytes.toString('hex');
        return token;
    }



}
