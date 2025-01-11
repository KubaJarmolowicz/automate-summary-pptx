import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import { readFileSync } from "fs";
import { ProcessedData } from "../types";

export class PresentationService {
  private readonly TEMPLATE_PATH = "templates/template.pptx";

  private formatNumber(num: string): string {
    return parseInt(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  private formatDecimal(num: number, decimals: number = 2): string {
    return num.toFixed(decimals).replace(".", ",");
  }

  private formatPP(ctr: number, benchmark: number): string {
    const diff = ctr - benchmark;
    const sign = diff > 0 ? "+" : "";
    return `(${sign}${this.formatDecimal(diff)} p.p.)`;
  }

  async generatePresentation(data: ProcessedData): Promise<Buffer> {
    const template = readFileSync(this.TEMPLATE_PATH);

    const opts: {
      centered: boolean;
      fileType: "pptx" | "docx";
      getImage: (tagValue: string) => Buffer;
      getSize: () => [number, number];
    } = {
      centered: false,
      fileType: "pptx",
      getImage: () => data.image,
      getSize: () => [191, 415],
    };

    const imageModule = new ImageModule(opts);
    const zip = new PizZip(template);
    const doc = new Docxtemplater(zip, {
      modules: [imageModule],
    });

    const ctr =
      (parseInt(data.stats.totalClicks) /
        parseInt(data.stats.totalImpressions)) *
      100;
    const benchmarkValue = parseFloat(data.benchmark);

    const templateData = {
      campaignName: data.campaignName,
      format: data.format,
      date: data.date,
      goal: this.formatNumber(data.goal),
      url: data.url,
      benchmark: `${data.benchmark}%`,
      category: data.category,
      image: "1", // Image placeholder
      totalImpressions: this.formatNumber(data.stats.totalImpressions),
      uniqueImpressions: this.formatNumber(data.stats.uniqueImpressions),
      totalClicks: this.formatNumber(data.stats.totalClicks),

      // New calculated fields (using raw numbers for calculations)
      realizationPercent: `${this.formatDecimal(
        (parseInt(data.stats.totalImpressions) / parseInt(data.goal)) * 100,
        1
      )}%`,

      frequency: this.formatDecimal(
        parseInt(data.stats.totalImpressions) /
          parseInt(data.stats.uniqueImpressions),
        1
      ),

      ctr: `${this.formatDecimal(ctr)}%`,

      pp: this.formatPP(ctr, benchmarkValue),
      ppIsPositive: ctr > benchmarkValue,
    };

    doc.render(templateData);

    return doc.getZip().generate({ type: "nodebuffer" });
  }
}
