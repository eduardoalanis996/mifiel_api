
import Application from '@ioc:Adonis/Core/Application'
import { PDFDocument } from 'pdf-lib';
import fs from 'fs'

class PdfService {


    public async mixFile(source1, source2, newFileName) {

        const pdfBytes1 = await fs.readFileSync(source1);
        const pdfBytes2 = await fs.readFileSync(source2);

        const pdfDoc1 = await PDFDocument.load(pdfBytes1);
        const pdfDoc2 = await PDFDocument.load(pdfBytes2);

        const pdfDoc = await PDFDocument.create();

        const pages1 = await pdfDoc.copyPages(pdfDoc1, pdfDoc1.getPageIndices());
        pages1.forEach((page) => pdfDoc.addPage(page));

        const pages2 = await pdfDoc.copyPages(pdfDoc2, pdfDoc2.getPageIndices());
        pages2.forEach((page) => pdfDoc.addPage(page));

        const combinedPdfBytes = await pdfDoc.save();

        const path = `${Application.appRoot}/storage/${newFileName}.pdf`

        await fs.writeFileSync(path, combinedPdfBytes);

        return path
    }


}

export default new PdfService()