import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PDFDocument } from 'pdf-lib';
import { PDFFormInterface } from '../../../models/pdf/pdf-form.interface';
import { CommonModule } from '@angular/common';

interface PDFField {
  controlName: string;
  pdfField: string;
  label: string;
  tooltip: string;
  type: 'text' | 'radio' | 'checkbox';
  options?: { label: string, value: any }[];
}

@Component({
  selector: 'app-mpa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mpa-form.component.html',
  styleUrls: ['./mpa-form.component.css']
})
export class MpaFormComponent implements PDFFormInterface, OnInit {
  form: FormGroup;
  pdfDoc: PDFDocument | null = null;

  // Define the fields. The first 44 are mapped to your PDF fields (assumed text),
  // and two extra fields are added for demonstration (a radio group and a checkbox).
  fields: PDFField[] = [
    { controlName: 'field41', pdfField: 'NameTXT',         label: 'Name',            tooltip: 'Enter your name', type: 'text' },
    { controlName: 'field42', pdfField: 'NomineeTxt',      label: 'Nominee',         tooltip: 'Enter nominee name', type: 'text' },
    { controlName: 'field43', pdfField: 'NomineeAddress',  label: 'Nominee Address', tooltip: 'Enter nominee address', type: 'text' },
    { controlName: 'field44', pdfField: 'NomineePhone',    label: 'Nominee Phone',   tooltip: 'Enter nominee phone number', type: 'text' },
    { controlName: 'field1',  pdfField: 'form_MPOA[0].page1[0].s1[0].p2[0].TextField1[0]', label: 'Field 1', tooltip: 'Enter value for Field 1', type: 'text' },
    { controlName: 'field2',  pdfField: 'form_MPOA[0].page1[0].s1[0].p2[0].TextField1[1]', label: 'Field 2', tooltip: 'Enter value for Field 2', type: 'text' },
    { controlName: 'field3',  pdfField: 'form_MPOA[0].page1[0].s1[0].p2[0].TextField1[2]', label: 'Field 3', tooltip: 'Enter value for Field 3', type: 'text' },
    { controlName: 'field4',  pdfField: 'form_MPOA[0].page1[0].s1[0].p2[0].TextField1[3]', label: 'Field 4', tooltip: 'Enter value for Field 4', type: 'text' },
    { controlName: 'field5',  pdfField: 'form_MPOA[0].page1[0].s1[0].p4[0].p1[0].#subform[0].TextField2[0]', label: 'Name of first alternate agent', tooltip: 'Enter value for Field 5', type: 'text' },
    { controlName: 'field6',  pdfField: 'form_MPOA[0].page1[0].s1[0].p4[0].p1[0].#subform[0].TextField2[1]', label: 'Address of first alternate agent', tooltip: 'Enter value for Field 6', type: 'text' },
    { controlName: 'field7',  pdfField: 'form_MPOA[0].page1[0].s1[0].p4[0].p1[0].#subform[0].TextField2[2]', label: 'Phone Number of first alternate agent', tooltip: 'Enter value for Field 7', type: 'text' },
    { controlName: 'field8',  pdfField: 'form_MPOA[0].page1[0].s1[0].p4[0].p1[0].#subform[1].TextField2[3]', label: 'Name of second alternate agent', tooltip: 'Enter value for Field 8', type: 'text' },
    { controlName: 'field9',  pdfField: 'form_MPOA[0].page1[0].s1[0].p4[0].p1[0].#subform[1].TextField2[4]', label: 'Address of second alternate agent', tooltip: 'Enter value for Field 9', type: 'text' },
    { controlName: 'field10', pdfField: 'form_MPOA[0].page1[0].s1[0].p4[0].p1[0].#subform[1].TextField2[5]', label: 'Phone Number of second alternate agent', tooltip: 'Enter value for Field 10', type: 'text' },
    { controlName: 'field11', pdfField: 'form_MPOA[0].page1[0].s1[0].p4[0].p1[0].#subform[2].TextField2[6]', label: 'Original document  kept', tooltip: 'Enter value for Field 11', type: 'text' },
    { controlName: 'field12', pdfField: 'form_MPOA[0].page1[0].s1[0].p4[0].p1[0].#subform[3].TextField2[7]', label: 'Individuals name', tooltip: 'Enter value for Field 12', type: 'text' },
    { controlName: 'field13', pdfField: 'form_MPOA[0].page1[0].s1[0].p4[0].p1[0].#subform[3].TextField2[8]', label: ' Individuals Address', tooltip: 'Enter value for Field 13', type: 'text' },
    { controlName: 'field14', pdfField: 'form_MPOA[0].page1[0].s1[0].p4[0].p1[0].#subform[4].TextField2[9]', label: 'Individuals name', tooltip: 'Enter value for Field 14', type: 'text' },
    { controlName: 'field15', pdfField: 'form_MPOA[0].page1[0].s1[0].p4[0].p1[0].#subform[4].TextField2[10]', label: 'Individuals Address', tooltip: 'Enter value for Field 15', type: 'text' },
    { controlName: 'field16', pdfField: 'form_MPOA[0].page2[0].s2[0].TextField2[0]', label: 'power of attorney ends on', tooltip: 'Enter value for Field 16', type: 'text' },
    { controlName: 'field17', pdfField: 'form_MPOA[0].page3[0].s6[0].p2[0].p1[0].NumericField1[0]', label: 'Day of month', tooltip: 'Enter value for Field 17', type: 'text' },
    { controlName: 'field18', pdfField: 'form_MPOA[0].page3[0].s6[0].p2[0].p1[0].DateField2[0]', label: 'Month and year', tooltip: 'Enter value for Field 18', type: 'text' },
    { controlName: 'field19', pdfField: 'form_MPOA[0].page3[0].s6[0].p2[0].p2[0].TextField2[0]', label: 'city and state', tooltip: 'Enter value for Field 19', type: 'text' },
    { controlName: 'field20', pdfField: 'form_MPOA[0].page3[0].s6[0].p2[0].p3[0].SignatureField2[0]', label: 'Print name', tooltip: 'Enter value for Field 20', type: 'text' },
    { controlName: 'field21', pdfField: 'form_MPOA[0].page3[0].s6[0].p2[0].p4[0].TextField2[0]', label: 'Name of witness one', tooltip: 'Enter value for Field 21', type: 'text' },
    { controlName: 'field22', pdfField: 'form_MPOA[0].page3[0].s6[0].p3[0].TextField3[0]', label: 'Date', tooltip: 'Enter value for Field 22', type: 'text' },
    { controlName: 'field23', pdfField: 'form_MPOA[0].page3[0].s6[0].p4[0].p1[0].NumericField1[0]', label: 'Name of person acknowledging', tooltip: 'Enter value for Field 23', type: 'text' },
    { controlName: 'field24', pdfField: 'form_MPOA[0].page3[0].s6[0].p4[0].p1[0].TextField5[0]', label: '  Notarys printed name', tooltip: 'Enter value for Field 24', type: 'text' },
    { controlName: 'field25', pdfField: 'form_MPOA[0].page3[0].s6[0].p4[0].p2[0].left[0].p1[0].SignatureField3[0]', label: 'My commission expires', tooltip: 'Enter value for Field 25', type: 'text' },
    { controlName: 'field26', pdfField: 'form_MPOA[0].page3[0].s6[0].p4[0].p2[0].left[0].p2[0].TextField4[0]', label: 'Day of month', tooltip: 'Enter value for Field 26', type: 'text' },
    { controlName: 'field27', pdfField: 'form_MPOA[0].page3[0].s6[0].p4[0].p2[0].left[0].p3[0].TextField2[0]', label: 'month and year', tooltip: 'Enter value for Field 27', type: 'text' },
    { controlName: 'field28', pdfField: 'form_MPOA[0].page4[0].s7[0].p2[0].p1[0].NumericField1[0]', label: 'city and state', tooltip: 'Enter value for Field 28', type: 'text' },
    { controlName: 'field29', pdfField: 'form_MPOA[0].page4[0].s7[0].p2[0].p1[0].DateField2[0]', label: 'print name', tooltip: 'Enter value for Field 29', type: 'text' },
    { controlName: 'field30', pdfField: 'form_MPOA[0].page4[0].s7[0].p2[0].p2[0].TextField2[0]', label: ' Printed Name of first witness', tooltip: 'Enter value for Field 30', type: 'text' },
    { controlName: 'field31', pdfField: 'form_MPOA[0].page4[0].s7[0].p2[0].p3[0].SignatureField2[0]', label: 'Date of first witness signature', tooltip: 'Enter value for Field 31', type: 'text' },
    { controlName: 'field32', pdfField: 'form_MPOA[0].page4[0].s7[0].p2[0].p4[0].TextField2[0]', label: 'First witness address', tooltip: 'Enter value for Field 32', type: 'text' },
    { controlName: 'field33', pdfField: 'form_MPOA[0].page4[0].s8[0].p3[0].SignatureField4[0]', label: 'Printed Name of Second witness', tooltip: 'Enter value for Field 33', type: 'text' },
    { controlName: 'field34', pdfField: 'form_MPOA[0].page4[0].s8[0].p3[0].TextField2[0]', label: 'Date of Second witness signature', tooltip: 'Enter value for Field 34', type: 'text' },
    { controlName: 'field35', pdfField: 'form_MPOA[0].page4[0].s8[0].p3[0].DateField3[0]', label: 'Second witness address', tooltip: 'Enter value for Field 35', type: 'text' },
    { controlName: 'field36', pdfField: 'form_MPOA[0].page4[0].s8[0].p3[0].TextField2[1]', label: 'Field 36', tooltip: 'Enter value for Field 36', type: 'text' },
    { controlName: 'field37', pdfField: 'form_MPOA[0].page4[0].s9[0].p2[0].SignatureField4[0]', label: 'Field 37', tooltip: 'Enter value for Field 37', type: 'text' },
    { controlName: 'field38', pdfField: 'form_MPOA[0].page4[0].s9[0].p2[0].TextField2[0]', label: 'Field 38', tooltip: 'Enter value for Field 38', type: 'text' },
    { controlName: 'field39', pdfField: 'form_MPOA[0].page4[0].s9[0].p2[0].DateField3[0]', label: 'Field 39', tooltip: 'Enter value for Field 39', type: 'text' },
    { controlName: 'field40', pdfField: 'form_MPOA[0].page4[0].s9[0].p2[0].TextField2[1]', label: 'Field 40', tooltip: 'Enter value for Field 40', type: 'text' },
  
    // Extra demonstration fields for other input types:
    {
      controlName: 'field45',
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
      controlName: 'field46',
      pdfField: 'ConsentField',
      label: 'Consent',
      tooltip: 'Check if you agree',
      type: 'checkbox'
    }
  ];

  constructor(private fb: FormBuilder) {
    const formControls = this.fields.reduce((controls, field) => {
      // For checkboxes, you may want a boolean default.
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
      const url = 'assets/pdf/MedicalPowerOfAttorney.pdf';
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
    const form = this.pdfDoc.getForm();
    const availableFields = form.getFields().map(field => field.getName());
    this.fields.forEach(fieldDef => {
      const value = this.form.get(fieldDef.controlName)?.value;
      if (availableFields.includes(fieldDef.pdfField)) {
        try {
          switch (fieldDef.type) {
            case 'text':
              form.getTextField(fieldDef.pdfField).setText(value || '');
              break;
            case 'radio':
              form.getRadioGroup(fieldDef.pdfField).select(value);
              break;
            case 'checkbox':
              const checkbox = form.getCheckBox(fieldDef.pdfField);
              value ? checkbox.check() : checkbox.uncheck();
              break;
            default:
              form.getTextField(fieldDef.pdfField).setText(value || '');
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

}
