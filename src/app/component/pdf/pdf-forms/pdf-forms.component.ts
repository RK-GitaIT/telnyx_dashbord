import { Component, ViewChild } from '@angular/core';
import { PDFFormInterface } from '../../../models/pdf/pdf-form.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MpaFormComponent } from '../mpa-form/mpa-form.component';
import { HipaaFormComponent } from '../hippa-form/hippa-form.component';
import { PdfService } from '../../../services/pdf/pdf.service';

@Component({
  selector: 'app-pdf-forms',
  standalone: true,
  imports: [CommonModule, FormsModule, MpaFormComponent, HipaaFormComponent],
  templateUrl: './pdf-forms.component.html',
  styleUrls: ['./pdf-forms.component.css'],
})
export class PdfFormsComponent {
  // Dynamically reference the loaded child component via the common interface.
  @ViewChild('childComponent') childComponent?: PDFFormInterface;

  selectedFormType: string = '';
  formData: any = null;
  isFormSubmitted: boolean = false;

  constructor(private pdfService: PdfService) {}

  handlePreviewPdf(): void {
    if (this.childComponent) {
      this.childComponent.previewPdf();
    } else {
      console.error('No form loaded for preview.');
    }
  }

  handleDownloadPdf(): void {
    if (this.childComponent) {
      this.childComponent.downloadPdf();
    } else {
      console.error('No form loaded for download.');
    }
  }

  handlePdfMapping(): void {
    if (this.childComponent) {
      this.childComponent.pdfMapping();
    } else {
      console.error('No form loaded for mapping.');
    }
  }

  submitChildForm(): void {
    if (this.childComponent) {
      this.childComponent.submitForm();
    } else {
      console.error('No form loaded to submit.');
    }
  }

  handleCancel(): void {
    if (this.childComponent) {
      this.childComponent.resetForm();
      this.isFormSubmitted = false;
      console.log('Form cancelled/reset.');
    } else {
      console.error('No form loaded to cancel.');
    }
  }

  handleFormSubmit(data: any): void {
    this.formData = data;
    this.isFormSubmitted = true;
    console.log('Form submitted:', this.formData.mapping);

    // Prepare an ID. If not available in submitted data, use a default (e.g. 1).
    const id = data.id || 1;

    // Convert data to a string (if required) and call your HTTP service.
    this.pdfService.postPdfData(id, JSON.stringify(this.formData.mapping)).subscribe({
      next: response => console.log('Response:', response),
      error: err => console.error('Error:', err)
    });
  }

  handleResetTriggered(): void {
    console.log('Child component has reset the form.');
  }
}
