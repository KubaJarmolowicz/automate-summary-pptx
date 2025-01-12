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
          ?.trim() || "null";

      const uniqueImpressions =
        html
          .match(/<h1[^>]*>([0-9 ]+) \//g)?.[0]
          ?.replace(/<[^>]+>/g, "")
          ?.replace("/", "")
          ?.trim() || "null";

      const totalClicks =
        html
          .match(/<h1[^>]*>([0-9 ]+)<\/h1>/g)?.[1]
          ?.replace(/<[^>]+>/g, "")
          ?.trim() || "null";

      // Validate that we got actual numbers
      if (
        isNaN(Number(totalImpressions)) ||
        isNaN(Number(uniqueImpressions)) ||
        isNaN(Number(totalClicks))
      ) {
        throw new Error("Nie znaleziono wymaganych danych na stronie");
      }

      return {
        totalImpressions,
        uniqueImpressions,
        totalClicks,
      };
    } catch (error) {
      await this.logger.logError("WebScraper", error as Error);
      throw new Error(
        "Nie udało się pobrać danych ze strony. Sprawdź czy URL jest poprawny i czy masz dostęp do statystyk."
      );
    }
  }
}
