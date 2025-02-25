import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PDFFormInterface } from '../../../models/pdf/pdf-form.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PDFDocument } from 'pdf-lib';

interface PDFField {
  controlName: string;
  pdfField: string;
  label: string;
  tooltip: string;
  type: 'text' | 'radio' | 'checkbox' | 'date';
  options?: { label: string, value: any }[];
}

@Component({
  selector: 'app-hippa-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hippa-form.component.html',
  styleUrl: './hippa-form.component.css'
})

export class HipaaFormComponent implements PDFFormInterface, OnInit {
  form: FormGroup;
  pdfDoc: PDFDocument | null = null;
    // Toggle flags for conditional displays
    showExceptions = false;
    showOtherInfo = false;

    // Define the PDF fields mapping (modify labels as needed)
  fields: PDFField[] = [
    { controlName: 'field1', pdfField: 'Date', label: 'Date', tooltip: 'Enter date', type: 'date' },
    { controlName: 'field2', pdfField: 'Print your name', label: 'Print Your Name', tooltip: 'Enter your name', type: 'text' },
    { controlName: 'field3', pdfField: 'undefined_2', label: 'Field 3', tooltip: 'Enter value', type: 'text' },
    { controlName: 'field4', pdfField: 'Signature1_es_:signer:signature', label: 'Signature', tooltip: 'Enter signature', type: 'text' },
    { controlName: 'field5', pdfField: 'Signature2_es_:signer:signature', label: 'Legal Authority', tooltip: 'Enter authority details', type: 'text' },
    { controlName: 'field6', pdfField: 'Name', label: 'Patient Name', tooltip: 'Enter patient name', type: 'text' },
    { controlName: 'field7', pdfField: 'MentalhealthrecordsCB', label: 'Mental Health Records', tooltip: '', type: 'checkbox' },
    { controlName: 'field8', pdfField: 'ComminicableDiseasesCB', label: 'Communicable Diseases', tooltip: '', type: 'checkbox' },
    { controlName: 'field9', pdfField: 'Alcoholdrugabusetreatmentrecords', label: 'Alcohol/Drug Records', tooltip: '', type: 'checkbox' },
    { controlName: 'field10', pdfField: 'Geneticinformation', label: 'Genetic Information', tooltip: '', type: 'checkbox' },
    { controlName: 'field11', pdfField: 'OtherSpecify', label: 'Other (Specify)', tooltip: '', type: 'text' },
    { controlName: 'field12', pdfField: 'sharinginformationrequest_1', label: 'Reason for Disclosure', tooltip: '', type: 'text' },
    { controlName: 'field13', pdfField: 'sharinginformationrequest_2', label: 'Field 13', tooltip: '', type: 'text' },
    { controlName: 'field14', pdfField: 'sharinginformationrequest_3', label: 'Field 14', tooltip: '', type: 'text' },
    { controlName: 'field15', pdfField: 'Other_1', label: 'Other (Specify)', tooltip: '', type: 'text' },
    { controlName: 'field16', pdfField: 'Other_2', label: 'Field 16', tooltip: '', type: 'text' },
    { controlName: 'field17', pdfField: 'Other_3', label: 'Field 17', tooltip: '', type: 'text' },
    { controlName: 'field18', pdfField: 'Other_4', label: 'Field 18', tooltip: '', type: 'text' },
    { controlName: 'field19', pdfField: 'Other_1_2', label: 'Field 19', tooltip: '', type: 'text' },
    { controlName: 'field20', pdfField: 'Other_2_2', label: 'Field 20', tooltip: '', type: 'text' },
    { controlName: 'field21', pdfField: 'Health_Information_Name', label: 'Recipient Name', tooltip: '', type: 'text' },
    { controlName: 'field22', pdfField: 'Health_Information_Organization', label: 'Recipient Organization', tooltip: '', type: 'text' },
    { controlName: 'field23', pdfField: 'Describe_legal_authority_sign_form_2', label: 'Legal Authority 1', tooltip: '', type: 'text' },
    { controlName: 'field24', pdfField: 'Describe_legal_authority_sign_form_3', label: 'Legal Authority 2', tooltip: '', type: 'text' },
    { controlName: 'field25', pdfField: 'Describe_legal_authority_sign_form_4', label: 'Legal Authority 3', tooltip: '', type: 'text' },
    { controlName: 'field26', pdfField: 'Form_of_Disclosure', label: 'Electronic Copy', tooltip: '', type: 'checkbox' },
    { controlName: 'field27', pdfField: 'Reason_for_Disclosure', label: 'Hard Copy', tooltip: '', type: 'checkbox' },
    { controlName: 'field28', pdfField: 'Duration_to', label: 'To Date', tooltip: '', type: 'date' },
    { controlName: 'field29', pdfField: 'Duration_a', label: 'From Date', tooltip: '', type: 'date' },
    { controlName: 'field30', pdfField: 'Duration_From', label: 'From Date', tooltip: '', type: 'date' },
    { controlName: 'field31', pdfField: 'Information_share', label: 'Information Share', tooltip: '', type: 'text' },
    { controlName: 'field32', pdfField: 'Health_Information_Name2', label: 'Revocation Name', tooltip: '', type: 'text' },
    { controlName: 'field33', pdfField: 'Health_Information_Organization2', label: 'Revocation Organization', tooltip: '', type: 'text' },
    { controlName: 'field34', pdfField: 'Health_Information_Address', label: 'Recipient Address', tooltip: '', type: 'text' },
    { controlName: 'field35', pdfField: 'Health_Information_Address2', label: 'Revocation Address', tooltip: '', type: 'text' },
    { controlName: 'field36', pdfField: 'Duration_b', label: 'All Periods', tooltip: '', type: 'text' },
    { controlName: 'field37', pdfField: 'Duration_c', label: 'Until Event', tooltip: '', type: 'checkbox' },
    { controlName: 'field38', pdfField: 'undefined1', label: 'Disclose My Complete Health Records', tooltip: '', type: 'checkbox' },
    { controlName: 'field39', pdfField: 'undefined2', label: 'Show Exceptions', tooltip: '', type: 'checkbox' },
    {
      controlName: 'field40',
      pdfField: 'GenderField',
      label: 'Gender',
      tooltip: 'Select your gender',
      type: 'radio',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' }
      ]
    },
    {
      controlName: 'field41',
      pdfField: 'ConsentField',
      label: 'Consent',
      tooltip: 'Check if you agree',
      type: 'checkbox'
    }
  ];

  constructor(private fb: FormBuilder) {
    // Build form controls – default checkboxes to false, others to empty strings.
    const formControls = this.fields.reduce((controls, field) => {
      controls[field.controlName] = field.type === 'checkbox' ? [false] : [''];
      return controls;
    }, {} as { [key: string]: any });
    this.form = this.fb.group(formControls);
  }

  async ngOnInit(): Promise<void> {
    await this.loadPdf();
    this.logAvailablePdfFields();
  }

  async loadPdf(): Promise<void> {
    try {
      const url = 'assets/pdf/HiPa.pdf';
      const pdfBytes = await fetch(url).then(res => res.arrayBuffer());
      this.pdfDoc = await PDFDocument.load(pdfBytes);
      console.log('PDF loaded successfully.');
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  logAvailablePdfFields(): void {
    if (!this.pdfDoc) return;
    const availableFields = this.pdfDoc.getForm().getFields().map(field => field.getName());
    console.log('Available PDF Form Fields:', availableFields);
  }

  async updatePdfFields(): Promise<void> {
    if (!this.pdfDoc) return;
    const formInstance = this.pdfDoc.getForm();
    const availableFields = formInstance.getFields().map(field => field.getName());
    this.fields.forEach(fieldDef => {
      const value = this.form.get(fieldDef.controlName)?.value;
      if (availableFields.includes(fieldDef.pdfField)) {
        try {
          switch (fieldDef.type) {
            case 'text':
            case 'date':
              formInstance.getTextField(fieldDef.pdfField).setText(value || '');
              break;
            case 'radio':
              formInstance.getRadioGroup(fieldDef.pdfField).select(value);
              break;
            case 'checkbox': {
              const checkbox = formInstance.getCheckBox(fieldDef.pdfField);
              value ? checkbox.check() : checkbox.uncheck();
              break;
            }
            default:
              formInstance.getTextField(fieldDef.pdfField).setText(value || '');
          }
          console.log(`Filled "${fieldDef.pdfField}" with value "${value}"`);
        } catch (e) {
          console.warn(`Error setting value for field "${fieldDef.pdfField}":`, e);
        }
      } else {
        console.warn(`PDF field "${fieldDef.pdfField}" not found. Available fields: ${availableFields.join(', ')}`);
      }
    });
  }

  async submitForm(): Promise<void> {
    if (!this.pdfDoc) return;
    await this.updatePdfFields();
    const pdfBytes = await this.pdfDoc.save();
    console.log('Form submitted. PDF bytes generated.');
    // Process pdfBytes as needed.
  }

  resetForm(): void {
    this.form.reset();
  }

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

   // Toggle showing the Exceptions section
   toggleExceptions(): void {
    this.showExceptions = !this.showExceptions;
  }

  // Toggle showing the "Other (Specify)" field
  toggleOtherInfo(): void {
    this.showOtherInfo = !this.showOtherInfo;
  }
}
