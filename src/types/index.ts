export interface ScrapedStats {
  totalImpressions: string;
  uniqueImpressions: string;
  totalClicks: string;
}

export interface ProcessedData {
  campaignName: string;
  format: string;
  date: string;
  goal: string;
  url: string;
  benchmark: string;
  category: string;
  image: Buffer;
  stats: ScrapedStats;
}

export interface PresentationRequest {
  campaignName: string;
  format: string;
  date: string;
  year: string;
  goal: string;
  url: string;
  benchmark: string;
  category: string;
  image: string; // base64 string
  email: string;
}
