export interface ImageSpecs {
  width: number;
  height: number;
  format: string;
}

export interface ProcessedData {
  metrics: any;
  images: Buffer[];
}
