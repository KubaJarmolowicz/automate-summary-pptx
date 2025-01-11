declare module "docxtemplater-image-module-free" {
  export default class ImageModule {
    constructor(options: {
      centered?: boolean;
      getImage(tagValue: string): Buffer;
      getSize(): [number, number];
      fileType: "docx" | "pptx";
    });
  }
}
