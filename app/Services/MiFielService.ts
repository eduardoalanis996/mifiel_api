
import axios from "axios";
import Env from '@ioc:Adonis/Core/Env'


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

}

export default new MiFielService()