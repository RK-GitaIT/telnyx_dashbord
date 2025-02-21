import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TelnyxService, CallStatus } from '../services/telnyx/telnyx.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-ivrcall',
  imports: [FormsModule, CommonModule],
  templateUrl: './ivrcall.component.html',
  styleUrls: ['./ivrcall.component.css']
})
export class IvrcallComponent implements OnInit {
  to: string = '';
  message: string = '';
  from: string = '';
  profiles: any[] = [];
  phoneNumbers: any[] = [];
  balance: number = 0;
  currency: string = 'USD';

  selectedProfile = {
    profileId: '',
    profileName: '',
    webhook_url: '',
  };

  constructor(private telnyxservice: TelnyxService, private profileService: ProfileService) {}

  ngOnInit() {
    this.fetchProfiles();
    this.fetchBalance();
    this.profileService.getProfileBalanceAsync();

    this.telnyxservice.callStatus$.subscribe((statusObj: CallStatus) => {
      if (statusObj && statusObj.status) {
        this.showToast(statusObj.status, statusObj.type);
      }
    });
  }

  fetchProfiles() {
    this.profileService.getMessagingProfiles().subscribe(
      (data) => {
        this.profiles = data.data;
        if (this.profiles.length > 0) {
          this.selectedProfile.profileId = this.profiles[0].id;
          this.onProfileChange();
        }
      },
      (error) => console.error('Error fetching profiles', error)
    );
  }

  fetchBalance() {
    this.profileService.getProfileBalance().subscribe(
      (data) => {
        this.balance = parseFloat(data.data.balance);
        this.currency = data.data.currency;
      },
      (error) => console.error('Error fetching balance', error)
    );
  }

  onProfileChange() {
    if (!this.selectedProfile.profileId) return;

    const selected = this.profiles.find(profile => profile.id === this.selectedProfile.profileId);
    if (selected) {
      this.selectedProfile.profileName = selected.name;
      this.profileService.setSelectedProfile(selected);

      this.profileService.getProfilesAssociatedPhonenumbers(this.selectedProfile.profileId).subscribe(
        (data) => {
          this.phoneNumbers = data.data || [];
          this.from = this.phoneNumbers.length > 0 ? this.phoneNumbers[0].phone_number : '';
        },
        (error) => console.error('Error fetching phone numbers', error)
      );
    }
  }

  showToast(message: string, type: 'info' | 'success' | 'error') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 p-3 rounded-lg shadow-lg text-white ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  }

  async sendVoiceMessage() {
    if (!this.from || !this.to || !this.message) {
      alert('Please fill all required fields.');
      return;
    }

    const confirmSend = confirm(
      `Note: SMS will only be sent to USA numbers.\nCost: $0.004 per SMS.\nCurrent Balance: ${this.balance} ${this.currency}\n\nDo you want to proceed?`
    );

    if (confirmSend) {
      this.showToast('📨 Sending voice message...', 'info');
      try {
        await this.telnyxservice.makeCall(
          this.to,
          this.from,
          this.selectedProfile.profileId,
          this.message
        );
        this.fetchBalance();
      } catch (error) {
        console.error('🚨 Error in sending voice message:', error);
        this.showToast('❌ An unexpected error occurred while sending the message.', 'error');
      }
    }
  }
}
