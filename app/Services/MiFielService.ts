
import axios from "axios";
import Env from '@ioc:Adonis/Core/Env'
import fs from 'fs'
import Application from '@ioc:Adonis/Core/Application'


class MiFielService {

    private credentials
    private headersAuth

    constructor() {
        this.credentials = Buffer.from(`${Env.get('MIFIEL_API_KEY')}:${Env.get('MIFIEL_API_SECRET')}`).toString('base64');
        this.headersAuth = {
            'Authorization': `Basic ${this.credentials}`
        }
    }

    public async createDocument(fileHash: unknown, fileName: string, signatories: Array<any>): Promise<any> {
        try {
            const request = await axios.post(`${Env.get('MIFIEL_API_URL')}documents`, {
                original_hash: fileHash,
                name: fileName,
                signatories: signatories.map((s) => {
                    return { name: s.name, email: s.email, tax_id: s.rfc }
                }),
                callback_url: `${Env.get('APP_DOMAIN')}callback_url`,
                sign_callback_url: `${Env.get('APP_DOMAIN')}sign_callback_url`
            }, {
                headers: this.headersAuth,
            })


            return request.data
        } catch (e) {
            throw new Error(e)
        }
    }

    public async downloadSignedDocument(documentId: string, type: string): Promise<any> {
        try {

            const urlPath = type == 'pdf' ? 'file_signed?download=true' : 'xml'

            const fileName =  type == 'pdf' ? 'signed_file' : 'contract_signed'

            const download = await axios.get(`${Env.get('MIFIEL_API_URL')}documents/${documentId}/${urlPath}`, {
                headers: this.headersAuth,
                responseType: 'stream',
            })

            const path = `${Application.appRoot}/storage/${fileName}_${documentId}.${type}`

            const writer = fs.createWriteStream(`${Application.appRoot}/storage/${fileName}_${documentId}.${type}`);

            download.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            return path
        } catch (e) {
            throw new Error(e)
        }
    }

}

export default new MiFielService()