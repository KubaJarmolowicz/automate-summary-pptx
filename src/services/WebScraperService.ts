import puppeteer from "puppeteer";
import { LogService } from "./LogService";

export class WebScraperService {
  private logger = new LogService();

  async scrapeUrls(urls: string[]): Promise<Record<string, any>> {
    const browser = await puppeteer.launch();
    const results: Record<string, any> = {};

    try {
      for (const url of urls) {
        const page = await browser.newPage();
        await page.goto(url);

        results[url] = {
          title: await page.$eval("title", (el) => el.textContent),
          // Add more scraping logic as needed
        };

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
