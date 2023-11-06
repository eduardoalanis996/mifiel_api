import fs from 'fs';

class XMLService {

    public async setFileContentToXML(filePath, content, hash, documentName) {
        try {
            const xmlContent = await fs.readFileSync(filePath, 'utf8');

            const newXmlContent = xmlContent.toString().replace(`<file contentType="" name="${documentName}" originalHash="${hash}"/>`,
                `<file contentType="" name="${documentName}" originalHash="${hash}">${content}<file>`)

            await fs.writeFileSync(filePath, newXmlContent);

            return filePath

        } catch (e) {
            console.error('Error al modificar el archivo XML:', e);
            throw new Error(e)
        }
    }



}

export default new XMLService()