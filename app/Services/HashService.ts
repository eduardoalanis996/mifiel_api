import crypto from 'crypto'

class HashService {

    public calculateHash(fileContent){
        try {
            const hash = crypto.createHash('sha256');
            hash.update(fileContent);
            const fileHash = hash.digest('hex');
            return fileHash
        } catch (error) {
            console.error('Error al leer el archivo:', error);
        }
    }

}

export default new HashService()