import { Request, Response } from "express";
import { ImageService } from "../services/ImageService";
import { PresentationService } from "../services/PresentationService";
import { EmailService } from "../services/EmailService";
import { WebScraperService } from "../services/WebScraperService";
//import { OpenAIService } from "../services/OpenAIService";

export class PresentationController {
  private imageService = new ImageService();
  private presentationService = new PresentationService();
  private emailService = new EmailService();
  private scraperService = new WebScraperService();
  //private openAIService = new OpenAIService();

  async generate(req: Request, res: Response): Promise<void> {
    try {
      const { urls, images, email } = req.body;

      // Validate input
      if (!urls?.length) {
        res.status(400).json({ error: "At least one URL is required" });
        return;
      }

      if (!images?.length) {
        res.status(400).json({ error: "At least one image is required" });
        return;
      }

      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      try {
        // Scrape URLs
        const scrapedData = await this.scraperService.scrapeUrls(urls);

        // Process images
        const processedImages = await Promise.all(
          images.map((base64: string, index: number) => {
            const imageBuffer = Buffer.from(base64, "base64");
            return this.imageService.processImage(
              imageBuffer,
              `slide${index + 1}-image`
            );
          })
        );

        // Generate presentation
        const presentation =
          await this.presentationService.generatePresentation({
            scrapedData,
            images: processedImages,
          });

        // Send email
        await this.emailService.sendPresentation(email, presentation);

        res.json({ success: true });
      } catch (error) {
        console.error("Processing error:", error);
        res.status(500).json({
          error: "Processing failed",
          details: (error as Error).message,
          step: this.identifyFailedStep(error),
        });
      }
    } catch (error) {
      console.error("Request error:", error);
      res.status(400).json({
        error: "Invalid request",
        details: (error as Error).message,
      });
    }
  }

  private identifyFailedStep(error: unknown): string {
    const errorMessage =
      error instanceof Error
        ? error.message.toLowerCase()
        : String(error).toLowerCase();
    if (errorMessage.includes("scrape")) return "URL scraping";
    if (errorMessage.includes("image")) return "Image processing";
    if (errorMessage.includes("presentation")) return "Presentation generation";
    if (errorMessage.includes("email")) return "Email sending";
    return "Unknown step";
  }
}
