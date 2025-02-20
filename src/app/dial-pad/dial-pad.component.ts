import { Component } from '@angular/core';
import { CallService } from '../services/call.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalltelnyxService } from '../services/telnyx/calltelnyx.service';
import { environment } from '../../config';

@Component({
  selector: 'app-dial-pad',
  imports: [FormsModule, CommonModule],
  templateUrl: './dial-pad.component.html',
  styleUrls: ['./dial-pad.component.css']
})
export class DialPadComponent {
  dialedNumber: string = '';
    callStatus: string = 'idle'; 
    isMuted: boolean = false;
    isOnHold: boolean = false;
    from: string = '';
    profiles: any[] = [];
    phoneNumbers: any[] = [];
    isRinging: boolean = false;
  
    selectedProfile = {
      id: '',
      profileName: '',
      webhook_event_url: '',
      username: '',
      password: '',
    };
  
    log = "";
  
    constructor(private calltelnyxService: CalltelnyxService,
        private callService: CallService) {}
  
    async ngOnInit() {
      // Load profiles from backend
      this.callService.callProfiles().subscribe(
        (data) => {
          this.profiles = data.data;
          console.log('Messaging Profiles:', this.profiles);
        },
        (error) => {
          console.error('Error fetching profiles', error);
        }
      );
    }
  
    onProfileChange() {
      if (!this.selectedProfile.id) return;
  
      const selected = this.profiles.find(
        (profile) => profile.id === this.selectedProfile.id
      );
      if (selected) {
        this.selectedProfile.profileName = selected.connection_name;
        this.selectedProfile.username = selected.user_name;
        this.selectedProfile.password = selected.password;
        // Fetch associated phone numbers
        this.callService
          .getProfilesAssociatedPhonenumbers(this.selectedProfile.id)
          .subscribe(
            (data) => {
              this.phoneNumbers = data.data || [];
              if (this.phoneNumbers.length > 0) {
                this.from = this.phoneNumbers[0].phone_number;
                console.log("Initial call");
                this.initializeTelnyxCredentials(this.selectedProfile.username, this.selectedProfile.password, environment.authToken);
              } else {
                this.from = '';
              }
            },
            (error) => {
              console.error('Error fetching associated phone numbers', error);
            }
          );
      }
    }
  
    appendDigit(digit: string) {
      this.dialedNumber += digit;
    }
  
    deleteLastDigit() {
      this.dialedNumber = this.dialedNumber.slice(0, -1);
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
  
    call() {
      if (this.dialedNumber) {
        this.calltelnyxService.call(this.dialedNumber, this.from);
      }
    }
  
    hangup() {
      this.calltelnyxService.hangup();
    }

    answerCall(){

    }
}