export interface PDFFormInterface {
    previewPdf(): void;
    downloadPdf(): void;
    pdfMapping(): void;
    submitForm(): Promise<void>;
    resetForm(): void;
  }
  