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

  // Reactive form for mapping data
  mappingForm: FormGroup;

  // Loaded PDF document (component-level)
  pdfDoc: PDFDocument | null = null;

  // Mapping between reactive form controls and the actual PDF field names.
  public fieldMapping: { [controlName: string]: string } = {
    labelName: 'form_MPOA[0].page1[0].s1[0].p2[0].TextField1[0]', 
    company:   'form_MPOA[0].page1[0].s1[0].p2[0].TextField1[1]'
  };

  constructor(private fb: FormBuilder) {
    this.mappingForm = this.fb.group({
      labelName: [''],
      company: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadPdf();
    this.logAvailablePdfFields();
  }

  // Load the PDF from assets.
  async loadPdf(): Promise<void> {
    try {
      const url = 'assets/pdf/MedicalPowerOfAttorney.pdf';
      const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
      this.pdfDoc = await PDFDocument.load(existingPdfBytes);
      console.log('PDF loaded successfully.');
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  // Logs all available PDF field names for debugging.
  logAvailablePdfFields(): void {
    if (!this.pdfDoc) return;
    const form = this.pdfDoc.getForm();
    const availableFields = form.getFields().map(field => field.getName());
    console.log('Available PDF Form Fields:', availableFields);
  }

  // Update the PDF fields with values from the reactive form.
  async updatePdfFields(): Promise<void> {
    if (!this.pdfDoc) return;
    const form = this.pdfDoc.getForm();
    const availableFields = form.getFields().map(field => field.getName());

    Object.keys(this.fieldMapping).forEach(controlName => {
      const pdfFieldName = this.fieldMapping[controlName];
      const value = String(this.mappingForm.get(controlName)?.value || '');

      if (availableFields.includes(pdfFieldName)) {
        try {
          form.getTextField(pdfFieldName).setText(value);
          console.log(`Filled "${pdfFieldName}" with value "${value}"`);
        } catch (e) {
          console.warn(`Error setting value for field "${pdfFieldName}":`, e);
        }
      } else {
        console.warn(
          `PDF field "${pdfFieldName}" not found. Available fields: ${availableFields.join(', ')}`
        );
      }
    });
  }

  // Handles form submission by updating the PDF and emitting the result.
  async submitForm(): Promise<void> {
    if (!this.pdfDoc) return;
    await this.updatePdfFields();

    const mappingResult: { [pdfFieldName: string]: any } = {};
    Object.keys(this.fieldMapping).forEach(controlName => {
      mappingResult[this.fieldMapping[controlName]] = this.mappingForm.get(controlName)?.value;
    });

    const pdfBytes = await this.pdfDoc.save();
    this.formSubmitted.emit({ mapping: mappingResult, filledPdfBytes: pdfBytes });
  }

  // Resets the mapping form.
  resetForm(): void {
    this.mappingForm.reset();
    this.resetTriggered.emit();
  }

  // Downloads the filled PDF.
  // Returns void to satisfy the PDFFormInterface.
  downloadPdf(): void {
    if (!this.pdfDoc) return;
    const pdfDoc = this.pdfDoc; // Now pdfDoc is definitely not null.
    (async () => {
      await this.updatePdfFields();
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'filled_form.pdf';
      a.click();
      URL.revokeObjectURL(url);
      console.log('PDF downloaded successfully.');
    })().catch(error => console.error('Error during PDF download:', error));
  }
  
}
