export interface ImageSpecs {
  width: number;
  height: number;
  format: string;
}

export interface ScrapedStats {
  totalImpressions: string;
  uniqueImpressions: string;
  uniqueClicks: string;
  urlIndex: number;
}

export interface ProcessedData {
  scrapedData: Record<number, ScrapedStats>;
  images: Buffer[];
}
