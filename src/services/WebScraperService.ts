import { LogService } from "./LogService";

interface ScrapedStats {
  totalImpressions: string;
  uniqueImpressions: string;
  totalClicks: string;
}

export class WebScraperService {
  private logger = new LogService();

  async scrapeUrl(url: string): Promise<ScrapedStats> {
    try {
      const response = await fetch(url);
      const html = await response.text();

      // Extract numbers using regex
      const totalImpressions =
        html
          .match(/<h1[^>]*>([0-9 ]+)<\/h1>/g)?.[0]
          ?.replace(/<[^>]+>/g, "")
          ?.trim() || "0";

      const uniqueImpressions =
        html
          .match(/<h1[^>]*>([0-9 ]+) \//g)?.[0]
          ?.replace(/<[^>]+>/g, "")
          ?.replace("/", "")
          ?.trim() || "0";

      const totalClicks =
        html
          .match(/<h1[^>]*>([0-9 ]+)<\/h1>/g)?.[1]
          ?.replace(/<[^>]+>/g, "")
          ?.trim() || "0";

      return {
        totalImpressions,
        uniqueImpressions,
        totalClicks,
      };
    } catch (error) {
      await this.logger.logError("WebScraper", error as Error);
      throw error;
    }
  }
}
