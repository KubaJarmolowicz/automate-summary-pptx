import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import { readFileSync } from "fs";
import { ProcessedData } from "../types";
import { StatsService } from "./StatsService";

export class PresentationService {
  private readonly TEMPLATE_PATH = "templates/template.pptx";

  async generatePresentation(data: ProcessedData): Promise<Buffer> {
    const template = readFileSync(this.TEMPLATE_PATH);

    const opts: {
      centered?: boolean;
      fileType: "pptx" | "docx";
      getImage: (tagValue: string) => Buffer;
      getSize: () => [number, number];
    } = {
      centered: false,
      fileType: "pptx",
      getImage: () => data.image,
      getSize: () => [191, 415] as [number, number],
    };

    const imageModule = new ImageModule(opts);
    const zip = new PizZip(template);
    const doc = new Docxtemplater(zip, {
      modules: [imageModule],
    });

    const templateData = {
      campaignName: data.campaignName,
      format: data.format,
      date: data.date,
      goal: StatsService.formatNumber(data.goal),
      url: data.url,
      benchmark: `${data.benchmark.replace(".", ",")}%`,
      category: data.category,
      image: "1", // Image placeholder
      totalImpressions: StatsService.formatNumber(data.stats.totalImpressions),
      uniqueImpressions: StatsService.formatNumber(
        data.stats.uniqueImpressions
      ),
      totalClicks: StatsService.formatNumber(data.stats.totalClicks),

      // New calculated fields (using raw numbers for calculations)
      realizationPercent: `${StatsService.formatDecimal(
        (parseInt(data.stats.totalImpressions) / parseInt(data.goal)) * 100,
        1
      )}%`,

      frequency: StatsService.formatDecimal(
        parseInt(data.stats.totalImpressions) /
          parseInt(data.stats.uniqueImpressions),
        1
      ),

      ctr: `${StatsService.formatDecimal(
        (parseInt(data.stats.totalClicks) /
          parseInt(data.stats.totalImpressions)) *
          100
      )}%`,

      pp: `(${StatsService.calculateStats(data.stats, data.benchmark).ppDiff})`,
      ppIsPositive:
        (Number(data.stats.totalClicks) / Number(data.stats.totalImpressions)) *
          100 >
        Number(data.benchmark),
    };

    doc.render(templateData);

    return doc.getZip().generate({ type: "nodebuffer" });
  }
}
