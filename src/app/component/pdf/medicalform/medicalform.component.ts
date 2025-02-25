import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

interface PdfField {
  name: string;
  type: 'text' | 'date' | 'checkbox' | 'radio' | 'dropdown';
  required: boolean;
  value?: any;
}

// Use the global pdfform variable provided by your local script.
// Ensure you have a declaration file (e.g., src/pdfform.d.ts) with:
//    declare const pdfform: any;
declare const pdfform: any;

@Component({
  selector: 'app-medicalform',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medicalform.component.html',
  styleUrls: ['./medicalform.component.css']
})
export class MedicalformComponent implements OnInit {
  pdfForm: FormGroup;
  pdfBuffer: ArrayBuffer | undefined;
  dynamicFields: PdfField[] = [];
  mappingDownloaded: boolean = false;

  constructor(private fb: FormBuilder) {
    this.pdfForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadPdf();
  }

  async loadPdf() {
    try {
      const url = 'assets/MedicalPowerOfAttorney.pdf'; // Replace with your actual PDF URL if needed.
      const response = await fetch(url);
      this.pdfBuffer = await response.arrayBuffer();
      this.dynamicFields = await this.extractDynamicFields(this.pdfBuffer);
      this.buildForm(this.dynamicFields);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  async extractDynamicFields(_buffer: ArrayBuffer): Promise<PdfField[]> {
    // Simulated extraction; replace with actual logic if available.
    return [
      { name: 'firstName', type: 'text', required: true, value: '' },
      { name: 'lastName', type: 'text', required: true, value: '' },
      { name: 'dob', type: 'date', required: false, value: '' },
      { name: 'agree', type: 'checkbox', required: true, value: false }
    ];
  }

  buildForm(fields: PdfField[]) {
    const group: any = {};
    fields.forEach(field => {
      if (field.type === 'checkbox') {
        group[field.name] = [field.value, field.required ? Validators.requiredTrue : []];
      } else {
        group[field.name] = [field.value, field.required ? Validators.required : []];
      }
    });
    this.pdfForm = this.fb.group(group);
  }

  // Downloads the mapping of PDF fields as a JSON file.
  downloadMappingFields() {
    if (!this.dynamicFields.length) {
      console.error('No mapping fields available.');
      return;
    }
    const mappingData = this.dynamicFields.map(field => ({
      name: field.name,
      type: field.type,
      required: field.required
    }));
    const jsonStr = JSON.stringify(mappingData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mapping_fields.json';
    a.click();
    window.URL.revokeObjectURL(url);
    this.mappingDownloaded = true;
  }

  // Previews the filled PDF using the current form data.
  previewPdf() {
    if (this.pdfForm.valid && this.pdfBuffer) {
      try {
        const formData = this.pdfForm.value;
        const filledPdfBytes = pdfform(this.pdfBuffer, formData);
        const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        // Open the filled PDF in a new tab for preview.
        window.open(url, '_blank');
      } catch (error) {
        console.error('Error previewing PDF:', error);
      }
    } else {
      console.error('Form is invalid or PDF not loaded.');
      Object.keys(this.pdfForm.controls).forEach(field => {
        const control = this.pdfForm.get(field);
        control?.markAsTouched();
      });
    }
  }

  // Called when the form is submitted.
  onSubmit() {
    if (this.pdfForm.valid && this.pdfBuffer && this.mappingDownloaded) {
      this.fillPdf();
    } else {
      console.error('Form is invalid, PDF not loaded, or mapping fields not downloaded.');
      Object.keys(this.pdfForm.controls).forEach(field => {
        const control = this.pdfForm.get(field);
        control?.markAsTouched();
      });
    }
  }

  // Fills the PDF using pdfform and triggers a download.
  fillPdf() {
    try {
      const formData = this.pdfForm.value;
      const filledPdfBytes = pdfform(this.pdfBuffer, formData);
      this.downloadPdf(filledPdfBytes, 'filled_form.pdf');
    } catch (error) {
      console.error('Error filling PDF:', error);
    }
  }

  // Utility function to download the filled PDF.
  downloadPdf(pdfBytes: Uint8Array, filename: string) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
