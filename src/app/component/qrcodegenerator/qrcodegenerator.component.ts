import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import QRCodeStyling, { DotType } from 'qr-code-styling';

@Component({
  selector: 'app-qrcodegenerator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qrcodegenerator.component.html',
  styleUrls: ['./qrcodegenerator.component.css']
})
export class QrcodegeneratorComponent implements AfterViewInit {
  // Form fields
  url: string = '';
  businessName: string = '';
  dotColor: string = '#000000';
  bgColor: string = '#ffffff';
  shape: DotType = 'rounded';
  size: number = 300;
  imageFile: File | null = null;
  downloadFormat: 'png' | 'svg' | 'jpg' = 'png';

  // State
  isQrGenerated: boolean = false;

  // The QRCodeStyling instance
  qrCode: QRCodeStyling;

  // ViewChild to hold the canvas container
  @ViewChild('qrCodeCanvas', { static: false }) qrCodeCanvas!: ElementRef;

  constructor() {
    // Initialize with default options
    this.qrCode = new QRCodeStyling({
      width: this.size,
      height: this.size,
      type: 'canvas',
      data: '',
      dotsOptions: { color: this.dotColor, type: this.shape },
      backgroundOptions: { color: this.bgColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 10 },
    });
  }

  ngAfterViewInit() {
    // Attach the QR code to the container right after view init
    if (this.qrCodeCanvas?.nativeElement) {
      this.qrCode.append(this.qrCodeCanvas.nativeElement);
    }
  }

  // Handle file input changes
  handleImageUpload(event: any) {
    this.imageFile = event.target.files[0] || null;
  }

  // Generate the QR code with the current form data
  generateQR() {
    if (!this.url) {
      // If there's no URL, do nothing (or you can show an alert)
      return;
    }

    // If user uploaded a logo image
    if (this.imageFile) {
      const reader = new FileReader();
      reader.onload = (evt: ProgressEvent<FileReader>) => {
        const imageData = evt.target?.result as string;
        this.updateQrCode(imageData);
      };
      reader.readAsDataURL(this.imageFile);
    }
    // If user has a Business Name but no file uploaded
    else if (this.businessName) {
      // Use a placeholder image that displays the business name
      const placeholder = `https://dummyimage.com/${this.size}x${this.size}/ffffff/000000.jpg&text=${encodeURIComponent(this.businessName)}`;
      this.updateQrCode(placeholder);
    } else {
      // No image or business name => just the QR code data
      this.updateQrCode('');
    }
  }

  // Helper method to update the QR code
  private updateQrCode(imageUrl: string) {
    this.qrCode.update({
      data: this.url,
      image: imageUrl,
      width: this.size,
      height: this.size,
      dotsOptions: { color: this.dotColor, type: this.shape },
      backgroundOptions: { color: this.bgColor },
    });
    this.isQrGenerated = true;
  }

  // Download the current QR code
  download() {
    const validFormat = this.downloadFormat === 'jpg' ? 'jpeg' : this.downloadFormat;
    this.qrCode.download({
      name: `${this.businessName || 'qr-code'}`,
      extension: validFormat as 'png' | 'svg' | 'jpeg',
    });
  }

  // Clear all fields and reset the QR code
  clearAll() {
    this.url = '';
    this.businessName = '';
    this.dotColor = '#000000';
    this.bgColor = '#ffffff';
    this.shape = 'rounded';
    this.size = 300;
    this.imageFile = null;
    this.downloadFormat = 'png';
    this.isQrGenerated = false;

    // Clear the container and re-initialize
    if (this.qrCodeCanvas?.nativeElement) {
      this.qrCodeCanvas.nativeElement.innerHTML = '';
    }
    this.qrCode = new QRCodeStyling({
      width: this.size,
      height: this.size,
      type: 'canvas',
      data: '',
      dotsOptions: { color: this.dotColor, type: this.shape },
      backgroundOptions: { color: this.bgColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 10 },
    });

    // Re-append the new instance
    if (this.qrCodeCanvas?.nativeElement) {
      this.qrCode.append(this.qrCodeCanvas.nativeElement);
    }
  }
}
