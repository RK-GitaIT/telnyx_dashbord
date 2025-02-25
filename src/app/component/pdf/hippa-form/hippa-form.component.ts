import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PDFFormInterface } from '../../../models/pdf/pdf-form.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PDFDocument } from 'pdf-lib';

@Component({
  selector: 'app-hippa-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hippa-form.component.html',
  styleUrl: './hippa-form.component.css'
})
export class HipaaFormComponent implements PDFFormInterface, OnInit {
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() resetTriggered = new EventEmitter<void>();

  // Define a reactive form for manual mapping.
  mappingForm: FormGroup;

  // Store the loaded PDF document.
  pdfDoc: PDFDocument | null = null;

  // Manual mapping: keys are the reactive form control names,
  // values are the corresponding PDF field names.
  public fieldMapping: { [controlName: string]: string } = {
    labelName: 'form_MPOA[0].page1[0].s1[0].p2[0].TextField1[0]', // For label name
    company:   'form_MPOA[0].page1[0].s1[0].p2[0].TextField1[1]'  // For company
    // Add additional mappings as needed.
  };

  constructor(private fb: FormBuilder) {
    // Create the reactive form with controls matching your mapping keys.
    this.mappingForm = this.fb.group({
      labelName: [''],
      company: ['']
      // Add more controls here if needed.
    });
  }

  ngOnInit(): void {
    this.loadPdf();
  }

  /**
   * Loads the PDF from assets, logs the header bytes, and initializes pdf-lib.
   */
  async loadPdf(): Promise<void> {
    try {
      const url = 'assets/pdf/MedicalPowerOfAttorney.pdf';
      const response = await fetch(url);
      const existingPdfBytes = await response.arrayBuffer();

      // Debug: Log first few bytes (should start with '%PDF-')
      console.log('First few bytes:', new Uint8Array(existingPdfBytes).slice(0, 5));

      this.pdfDoc = await PDFDocument.load(existingPdfBytes);
      console.log('PDF loaded successfully.');
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  /**
   * Fills the PDF using the provided mapping.
   * Each key of the mapping corresponds to a PDF field name.
   */
  async fillPdf(mapping: { [pdfFieldName: string]: any }): Promise<Uint8Array> {
    if (!this.pdfDoc) {
      throw new Error('PDF not loaded');
    }
    const form = this.pdfDoc.getForm();
    console.log('Starting PDF fill with mapping:', mapping);

    // Iterate over the mapping object and fill each PDF text field.
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
   * Builds a mapping object from the reactive form values
   * and fills the PDF, then emits the result.
   */
  async submitForm(): Promise<void> {
    console.log('[MPA] Submitting mapping form with values:', this.mappingForm.value);

    // Build the mapping object manually.
    const mapping: { [pdfFieldName: string]: any } = {};
    for (const controlName in this.fieldMapping) {
      const pdfFieldName = this.fieldMapping[controlName];
      mapping[pdfFieldName] = this.mappingForm.value[controlName];
      console.log(
        `Mapping reactive form control "${controlName}" with value "${this.mappingForm.value[controlName]}" to PDF field "${pdfFieldName}"`
      );
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
   * Displays the current PDF mapping (available PDF fields).
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

  // Placeholder methods for preview and download functionality.
  previewPdf(): void {
    console.log('[MPA] Previewing PDF with mapping values:', this.mappingForm.value);
    // Implement preview logic here.
  }

  downloadPdf(): void {
    console.log('[MPA] Downloading PDF with mapping values:', this.mappingForm.value);
    // Implement download logic here.
  }
}