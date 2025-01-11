import sharp, { FormatEnum } from "sharp";
import { LogService } from "./LogService";

export class ImageService {
  private logger = new LogService();
  private readonly FORMAT = "png";

  async processImage(image: Buffer, specKey: string): Promise<Buffer> {
    try {
      return await sharp(image)
        .toFormat(this.FORMAT as keyof FormatEnum)
        .toBuffer();
    } catch (error) {
      await this.logger.logError("ImageProcessing", error as Error);
      throw new Error(
        `Image processing failed for ${specKey}: ${(error as Error).message}`
      );
    }
  }
}
