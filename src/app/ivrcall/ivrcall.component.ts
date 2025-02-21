import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TelnyxService } from '../services/telnyx/telnyx.service';
import { ProfileService } from '../services/profile.service';
import { CalltelnyxService } from '../services/telnyx/calltelnyx.service';
import { environment } from '../../config';
import { CallService } from '../services/call.service';

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
  callStatus: string = 'idle'; 
  calldiscountstatus: any[] = ['hangup','destroy'];
  log = "";
  
  selectedProfile = {
    id: '',
    profileName: '',
    webhook_event_url: '',
    username: '',
    password: '',
  };

  constructor(private telnyxservice: TelnyxService,private profileService: ProfileService, private calltelnyxService: CalltelnyxService,private callService: CallService) {}

  async ngOnInit() {
    // Load profiles from backend
    this.callService.callProfiles().subscribe(
      (data:any) => {
        this.profiles = data.data;
        this.selectedProfile.id = this.profiles[0].id;
        this.onProfileChange();
        console.log('Messaging Profiles:', this.profiles);
      },
      (error:any) => {
        console.error('Error fetching profiles', error);
      }
    );
    this.calltelnyxService.callStatus$.subscribe(status => {
      this.callStatus = status;
      
      console.log("Status Initial", this.callStatus);
    });
  }

  
  initializeTelnyxCredentials(login: string, password: string, login_token: string) {
    this.calltelnyxService.setCredentials(login, password, login_token);
    this.calltelnyxService.initializeClient();
    this.connect();
    this.callStatus = "Connecting...";
  }

  connect() {
    this.log = "Connecting...";
    this.calltelnyxService.connect();
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

     async onProfileChange() {
        try {
          console.log(this.selectedProfile);
          if (!this.selectedProfile.id) return;
      
          console.log(this.selectedProfile);
          const selected = this.profiles.find(
            (profile) => profile.id === this.selectedProfile.id
          );
      
          if (selected) {
            this.selectedProfile.profileName = selected.connection_name;
            this.selectedProfile.username = selected.user_name;
            this.selectedProfile.password = selected.password;
      
            console.log(this.selectedProfile);
      
            // ✅ Correct usage of async/await
            const response = await this.callService.getProfilesAssociatedPhonenumbers(this.selectedProfile.id).toPromise();
            this.phoneNumbers = response?.data || [];
      
            if (this.phoneNumbers.length > 0) {
              this.from = this.phoneNumbers[0].phone_number;
              console.log("Initial call");
              this.initializeTelnyxCredentials(
                this.selectedProfile.username,
                this.selectedProfile.password,
                environment.authToken
              );
            } else {
              this.from = '';
            }
          }
        } catch (error) {
          console.error('Error fetching associated phone numbers', error);
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
          this.selectedProfile.id,          
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
