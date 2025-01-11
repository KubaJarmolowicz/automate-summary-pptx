import puppeteer from "puppeteer";
import { LogService } from "./LogService";

interface ScrapedStats {
  totalImpressions: string; // liczba wyświetleń
  uniqueImpressions: string; // unikalni użytkownicy (first number)
  uniqueClicks: string; // unikalni użytkownicy (second number)
  urlIndex: number; // Add index to track URL order
}

export class WebScraperService {
  private logger = new LogService();

  async scrapeUrls(urls: string[]): Promise<Record<number, ScrapedStats>> {
    const browser = await puppeteer.launch();
    const results: Record<number, ScrapedStats> = {};

    try {
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`Scraping URL ${i + 1}:`, url);

        const page = await browser.newPage();
        await page.goto(url);

        const uniqueUsersText = await page.$eval(
          ".panel-body .col-md-3:nth-child(3) h1",
          (el) => el.textContent?.trim() || "0 / 0"
        );

        console.log(`Got unique users text:`, uniqueUsersText);
        const [uniqueImpressions, uniqueClicks] = uniqueUsersText.split(" / ");

        results[i] = {
          totalImpressions: await page.$eval(
            ".panel-body .col-md-3:nth-child(1) h1",
            (el) => el.textContent?.trim() || "0"
          ),
          uniqueImpressions: uniqueImpressions || "0",
          uniqueClicks: uniqueClicks || "0",
          urlIndex: i + 1,
        };

        console.log(`Scraped data for URL ${i + 1}:`, results[i]);
        await page.close();
      }
    } catch (error) {
      await this.logger.logError("WebScraper", error as Error);
      throw error;
    } finally {
      await browser.close();
    }

    return results;
  }
}
