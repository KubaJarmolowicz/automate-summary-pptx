import sgMail from "@sendgrid/mail";
import { ScrapedStats } from "../types";
import { StatsService } from "./StatsService";

export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
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

    const msg = {
      to: recipientEmail,
      from: process.env.SENDGRID_VERIFIED_EMAIL || "",
      subject: `Podsumowanie kampanii ${campaignName} ${date}`,
      text: emailText,
      attachments: [
        {
          content: presentation.toString("base64"),
          filename: `podsumowanie_${campaignName}_${date}.pptx`,
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          disposition: "attachment",
        },
      ],
    };

    await sgMail.send(msg);
  }
}
