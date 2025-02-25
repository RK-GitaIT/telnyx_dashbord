import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PDFFormInterface } from '../../../models/pdf/pdf-form.interface';
import { PDFDocument } from 'pdf-lib';

@Component({
  selector: 'app-mpa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mpa-form.component.html',
  styleUrls: ['./mpa-form.component.css']
})
export class MpaFormComponent implements PDFFormInterface, OnInit {
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() resetTriggered = new EventEmitter<void>();

  // Reactive form to enter values that will be mapped to PDF fields.
  mappingForm: FormGroup;

  // Loaded PDF document.
  pdfDoc: PDFDocument | null = null;

  // Manual mapping between reactive form control names and the exact PDF field names.
  // (Note: The PDF field names now use the prefix "form[0]..." as required.)
  public fieldMapping: { [controlName: string]: string } = {
    labelName: 'form[0].page1[0].s1[0].p2[0].TextField1[0]', // e.g., Label Name
    company:   'form[0].page1[0].s1[0].p2[0].TextField1[1]'  // e.g., Company
    // Add additional mappings if needed.
  };

  constructor(private fb: FormBuilder) {
    // Create the reactive form with controls that match the keys in fieldMapping.
    this.mappingForm = this.fb.group({
      labelName: [''],
      company: ['']
      // Add more controls as needed.
    });
  }

  ngOnInit(): void {
    this.loadPdf();
  }

  /**
   * Loads the PDF from the assets folder using pdf‑lib.
   * Logs the first few bytes (to check for a valid PDF header) and stores the PDF document.
   */
  async loadPdf(): Promise<void> {
    try {
      const url = 'assets/pdf/MedicalPowerOfAttorney.pdf';
      const response = await fetch(url);
      const existingPdfBytes = await response.arrayBuffer();

      console.log('First few bytes:', new Uint8Array(existingPdfBytes).slice(0, 5)); // Should start with "%PDF-"

      this.pdfDoc = await PDFDocument.load(existingPdfBytes);
      console.log('PDF loaded successfully.');
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  /**
   * Fills the PDF using the provided mapping.
   * Each key in the mapping corresponds to a PDF field name, and its value is set from the mapping.
   */
  async fillPdf(mapping: { [pdfFieldName: string]: any }): Promise<Uint8Array> {
    if (!this.pdfDoc) {
      throw new Error('PDF not loaded');
    }
    const form = this.pdfDoc.getForm();
    console.log('Starting PDF fill with mapping:', mapping);

    // Loop over each PDF field name in the mapping and fill it with the corresponding value.
    for (const pdfFieldName in mapping) {
      try {
        const value = String(mapping[pdfFieldName]);
        const field = form.getTextField(pdfFieldName);
        field.setText(value);
        console.log(`Filled PDF field "${pdfFieldName}" with value "${value}"`);
      } catch (error) {
        console.warn(`Could not fill PDF field "${pdfFieldName}":`, error);
      }
    }

    const pdfBytes = await this.pdfDoc.save();
    console.log('PDF filled successfully. Final PDF size:', pdfBytes.length, 'bytes.');
    return pdfBytes;
  }

  /**
   * Submits the mapping form.
   * Builds a mapping object by pairing reactive form values with their corresponding PDF field names.
   * Fills the PDF and emits the mapping object along with the filled PDF bytes.
   */
  async submitForm(): Promise<void> {
    console.log('[MPA] Submitting mapping form with values:', this.mappingForm.value);

    const mapping: { [pdfFieldName: string]: any } = {};
    for (const controlName in this.fieldMapping) {
      const pdfFieldName = this.fieldMapping[controlName];
      mapping[pdfFieldName] = this.mappingForm.value[controlName];
      console.log(`Mapping reactive form control "${controlName}" with value "${this.mappingForm.value[controlName]}" to PDF field "${pdfFieldName}"`);
    }
    console.log('Final mapping object:', mapping);

    let filledPdfBytes: Uint8Array | undefined;
    if (this.pdfDoc) {
      try {
        filledPdfBytes = await this.fillPdf(mapping);
      } catch (error) {
        console.error('Error filling PDF:', error);
      }
    }
    console.log('Emitting form submission result.');
    this.formSubmitted.emit({ mapping, filledPdfBytes });
  }

  /**
   * Resets the mapping form.
   */
  resetForm(): void {
    console.log('[MPA] Resetting form.');
    this.mappingForm.reset();
    this.resetTriggered.emit();
  }

  /**
   * Displays the available PDF fields (the current PDF mapping) in the console.
   */
  pdfMapping(): void {
    console.log('[MPA] Displaying PDF mapping.');
    if (this.pdfDoc) {
      const form = this.pdfDoc.getForm();
      const fields = form.getFields().map(field => field.getName());
      console.log('Available PDF Form Fields:', fields);
    } else {
      console.warn('PDF not loaded, so no mapping available.');
    }
  }

  /**
   * Placeholder method for previewing the filled PDF.
   * (Implementation can open a new window/tab to show the filled PDF.)
   */
  previewPdf(): void {
    console.log('[MPA] Previewing PDF with mapping values:', this.mappingForm.value);
    // Implement preview logic here.
  }

  /**
   * Downloads the filled PDF.
   * Builds the mapping object from the reactive form values,
   * fills the PDF, converts it to a Blob, and triggers a download.
   */
  async downloadPdf(): Promise<void> {
    console.log('[MPA] Downloading PDF with mapping values:', this.mappingForm.value);

    const mapping: { [pdfFieldName: string]: any } = {};
    for (const controlName in this.fieldMapping) {
      const pdfFieldName = this.fieldMapping[controlName];
      mapping[pdfFieldName] = this.mappingForm.value[controlName];
      console.log(`Mapping reactive form control "${controlName}" with value "${this.mappingForm.value[controlName]}" to PDF field "${pdfFieldName}"`);
    }
    console.log('Final mapping object:', mapping);

    try {
      const filledPdfBytes = await this.fillPdf(mapping);
      const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'filled_form.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      console.log('PDF downloaded successfully.');
    } catch (error) {
      console.error('Error during PDF download:', error);
    }
  }
}
