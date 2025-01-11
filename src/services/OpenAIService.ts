import OpenAI from "openai";
import { LogService } from "./LogService";

export class OpenAIService {
  private openai: OpenAI;
  private logger = new LogService();

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeMetrics(
    scrapedData: Record<string, any>,
    ratio: number
  ): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `Analyze this data: ${JSON.stringify(
              scrapedData
            )} with ratio: ${ratio}`,
          },
        ],
      });

      return response.choices[0].message;
    } catch (error) {
      await this.logger.logError("OpenAI", error as Error);
      throw error;
    }
  }
}
