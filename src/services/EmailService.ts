import nodemailer from "nodemailer";
import { ScrapedStats } from "../types";
import { StatsService } from "./StatsService";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendPresentation(
    recipientEmail: string,
    presentation: Buffer,
    stats: ScrapedStats,
    goal: string,
    benchmark: string,
    category: string,
    calculatedStats: {
      ctr: string;
      isLowerThanBenchmark: boolean;
      ppDiff: string;
    },
    format: string,
    campaignName: string,
    date: string
  ) {
    const { ctr, isLowerThanBenchmark, ppDiff } = calculatedStats;
    const comparisonWord = isLowerThanBenchmark ? "poniżej" : "przewyższający";
    const actionName = StatsService.getActionName(format);

    const emailText = `
• zamówiony wolumen w postaci ${StatsService.formatNumber(
      goal
    )} wyświetleń zrealizowaliśmy z nadwyżką, generując dokładnie ${StatsService.formatNumber(
      stats.totalImpressions
    )} odsłon kampanii
• dotarliśmy z emisją do przeszło ${StatsService.formatNumber(
      stats.uniqueImpressions
    )} użytkowników przeglądających ofertę sieci
• odnotowaliśmy ${StatsService.formatNumber(stats.totalClicks)} ${actionName}
• uzyskaliśmy CTR=${ctr}% i jest to wynik ${comparisonWord} benchmark${
      isLowerThanBenchmark ? "u" : ""
    } dla kategorii ${category} o ${ppDiff}`;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: `Podsumowanie kampanii ${campaignName} ${date}`,
      text: emailText,
      attachments: [
        {
          filename: `podsumowanie_${campaignName}_${date}.pptx`,
          content: presentation,
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  }
}
