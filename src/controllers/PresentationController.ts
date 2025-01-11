import { Request, Response } from "express";
import { ImageService } from "../services/ImageService";
import { PresentationService } from "../services/PresentationService";
import { EmailService } from "../services/EmailService";
import { WebScraperService } from "../services/WebScraperService";
import { OpenAIService } from "../services/OpenAIService";

export class PresentationController {
  private imageService = new ImageService();
  private presentationService = new PresentationService();
  private emailService = new EmailService();
  private scraperService = new WebScraperService();
  private openAIService = new OpenAIService();

  async generate(req: Request, res: Response): Promise<void> {
    try {
      const { urls, images, ratio, email } = req.body;

      // Scrape URLs
      const scrapedData = await this.scraperService.scrapeUrls(urls);

      // Analyze with OpenAI
      const analysis = await this.openAIService.analyzeMetrics(
        scrapedData,
        ratio
      );

      // Process images
      const processedImages = await Promise.all(
        images.map((img: Buffer, index: number) =>
          this.imageService.processImage(img, `slide${index + 1}-image`)
        )
      );

      // Generate presentation
      const presentation = await this.presentationService.generatePresentation({
        metrics: { ...scrapedData, analysis },
        images: processedImages,
      });

      // Send email
      await this.emailService.sendPresentation(email, presentation);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
