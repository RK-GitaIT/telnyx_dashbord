export interface PDFFormInterface {
    downloadPdf(): void;
    submitForm(): Promise<void>;
    resetForm(): void;
  }
  