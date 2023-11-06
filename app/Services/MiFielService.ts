
import axios from "axios";
import Env from '@ioc:Adonis/Core/Env'
import fs  from 'fs'
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
        } catch (error) {
            console.error('Error al leer el archivo:', error.response.data);
        }
    }

    public async downloadSignedDocument(documentId: string = 'a20e23ed-4019-41c3-aa54-2bcf9dbecae4'): Promise<any> {
        try {
            const download = await axios.get(`${Env.get('MIFIEL_API_URL')}documents/${documentId}/file_signed?download=true`, {
                headers: this.headersAuth,
                responseType: 'stream',
            })

            const path = `${Application.appRoot}/storage/signed_file_${documentId}.pdf`

            const writer = fs.createWriteStream(`${Application.appRoot}/storage/signed_file_${documentId}.pdf`);

            download.data.pipe(writer);
        
            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });

            return path
        } catch (error) {
            console.error('Error al leer el archivo:', error);
        }
    }

}

export default new MiFielService()