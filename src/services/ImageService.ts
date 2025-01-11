import sharp, { FormatEnum } from "sharp";
import { ImageSpecs } from "../types";
import { LogService } from "./LogService";

export class ImageService {
  private logger = new LogService();
  private readonly SPECS: Record<string, ImageSpecs> = {
    "slide1-image": { width: 800, height: 600, format: "png" },
    "slide2-image": { width: 1024, height: 768, format: "png" },
  };

  async processImage(image: Buffer, specKey: string): Promise<Buffer> {
    const spec = this.SPECS[specKey];

    try {
      return await sharp(image)
        .resize(spec.width, spec.height)
        .toFormat(spec.format as keyof FormatEnum)
        .toBuffer();
    } catch (error) {
      await this.logger.logError("ImageProcessing", error);
      throw new Error(`Image processing failed for ${specKey}`);
    }
  }
}
