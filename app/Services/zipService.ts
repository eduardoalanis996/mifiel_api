import JSZip from "jszip";
import fs from 'fs'

class ZipService{

    public async  createZipFile(filePaths, zipFileName) {
        const zip = new JSZip();
      
        for (const filePath of filePaths) {
          const fileContent = await fs.readFileSync(filePath);
          const fileName = filePath.split('/').pop(); 
      
          zip.file(fileName, fileContent);
        }
      
        const zipData = await zip.generateAsync({ type: 'nodebuffer' });
      
        await fs.promises.writeFile(zipFileName, zipData);
      }

}

export default new ZipService()