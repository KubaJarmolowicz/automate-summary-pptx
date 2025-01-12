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
      const {
        campaignName,
        format,
        date,
        goal,
        url,
        benchmark,
        category,
        image,
      } = req.body;

      // Validate input
      if (!image) {
        res.status(400).json({ error: "Image is required" });
        return;
      }

      try {
        // Scrape URL
        const scrapedStats = await this.scraperService.scrapeUrl(url);

        // Process image
        const imageBuffer = Buffer.from(image, "base64");
        const processedImage = await this.imageService.processImage(
          imageBuffer,
          "slide-image"
        );

        // Generate presentation
        const presentation =
          await this.presentationService.generatePresentation({
            campaignName,
            format,
            date,
            goal,
            url,
            benchmark,
            category,
            image: processedImage,
            stats: scrapedStats, // Pass scraped stats to presentation
          });

        // Replace email from form with environment variable
        const recipientEmail = process.env.RECEPIENT;
        if (!recipientEmail) {
          throw new Error("Odbiorca emaila nie jest skonfigurowany");
        }

        await this.emailService.sendPresentation(recipientEmail, presentation);

        res.json({ message: "Prezentacja została wygenerowana i wysłana" });
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
