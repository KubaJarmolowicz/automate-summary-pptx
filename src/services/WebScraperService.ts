import puppeteer from "puppeteer";
import { LogService } from "./LogService";

interface ScrapedStats {
  totalImpressions: string;
  uniqueImpressions: string;
  totalClicks: string;
}

export class WebScraperService {
  private logger = new LogService();

  async scrapeUrl(url: string): Promise<ScrapedStats> {
    console.log("Environment:", process.env.NODE_ENV);

    // Check if Chrome exists
    const { execSync } = require("child_process");
    try {
      const chromeVersion = execSync("google-chrome --version").toString();
      console.log("Chrome version:", chromeVersion);
      console.log(
        "Chrome locations:",
        execSync("which google-chrome").toString()
      );
    } catch (err) {
      console.log("Error checking Chrome:", err);
    }

    const browserOptions = {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
      ],
      headless: true,
      executablePath:
        process.env.NODE_ENV === "production"
          ? "/opt/google/chrome/chrome"
          : undefined,
    };

    console.log("Launching browser with options:", browserOptions);
    const browser = await puppeteer.launch(browserOptions);

    try {
      const page = await browser.newPage();
      await page.goto(url);

      const uniqueUsersText = await page.$eval(
        ".panel-body .col-md-3:nth-child(3) h1",
        (el) => el.textContent?.trim() || "0 / 0"
      );

      const totalClicksText = await page.$eval(
        ".panel-body .col-md-3:nth-child(2) h1",
        (el) => el.textContent?.trim() || "0"
      );

      const [uniqueImpressions] = uniqueUsersText.split(" / ");

      const stats = {
        totalImpressions: await page.$eval(
          ".panel-body .col-md-3:nth-child(1) h1",
          (el) => el.textContent?.trim() || "0"
        ),
        uniqueImpressions: uniqueImpressions || "0",
        totalClicks: totalClicksText,
      };

      return stats;
    } catch (error) {
      await this.logger.logError("WebScraper", error as Error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
