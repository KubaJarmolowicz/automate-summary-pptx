import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import { readFileSync } from "fs";
import { ProcessedData } from "../types";

export class PresentationService {
  private readonly TEMPLATE_PATH = "templates/template.pptx";

  async generatePresentation(data: ProcessedData): Promise<Buffer> {
    const template = readFileSync(this.TEMPLATE_PATH);

    const opts: {
      centered: boolean;
      fileType: "pptx" | "docx";
      getImage: (tagValue: string) => Buffer;
      getSize: () => [number, number];
    } = {
      centered: false,
      fileType: "pptx",
      getImage: (tagValue: string) => {
        console.log("Image module - tagValue:", tagValue);
        const imageIndex = parseInt(tagValue) - 1;
        if (!data.images[imageIndex]) {
          console.error(
            `No image found for index ${imageIndex}, available images:`,
            data.images.length
          );
          throw new Error(`No image found for index ${imageIndex}`);
        }
        return data.images[imageIndex];
      },
      getSize: () => [191, 415],
    };

    const imageModule = new ImageModule(opts);
    const zip = new PizZip(template);
    const doc = new Docxtemplater(zip, {
      modules: [imageModule],
    });

    // Create template data
    const templateData: Record<string, string | number> = {};

    // Add image placeholders with % prefix
    data.images.forEach((_, index) => {
      templateData[`image${index + 1}`] = index + 1;
    });

    // Add stats
    Object.values(data.scrapedData).forEach((stats) => {
      const index = stats.urlIndex;
      templateData[`totalImpressions${index}`] = stats.totalImpressions;
      templateData[`uniqueImpressions${index}`] = stats.uniqueImpressions;
      templateData[`uniqueClicks${index}`] = stats.uniqueClicks;
    });

    // Single render call with data
    doc.render(templateData);

    return doc.getZip().generate({ type: "nodebuffer" });
  }
}
