import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import { readFileSync } from "fs";
import { ProcessedData } from "../types";

export class PresentationService {
  private readonly TEMPLATE_PATH = "templates/campaign-template.pptx";

  async generatePresentation(data: ProcessedData): Promise<Buffer> {
    const template = readFileSync(this.TEMPLATE_PATH);
    const imageModule = new ImageModule({
      centered: false,
      getImage: (tagValue: string) => {
        // tagValue will be 'image1', 'image2' etc.
        const imageIndex = parseInt(tagValue.replace("image", "")) - 1;
        return data.images[imageIndex];
      },
      getSize: () => [600, 400], // Default size, adjust as needed
    });

    const zip = new PizZip(template);
    const doc = new Docxtemplater(zip, {
      modules: [imageModule],
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.setData({
      metrics: data.metrics,
      image1: "image1",
      image2: "image2",
      image3: "image3",
    });

    doc.render();
    return doc.getZip().generate({ type: "nodebuffer" });
  }
}
