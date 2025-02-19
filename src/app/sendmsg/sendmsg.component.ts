import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SmsService } from '../services/sms.service';
import { ProfileService } from '../services/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sendmsg',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './sendmsg.component.html',
  styleUrls: ['./sendmsg.component.css']
})
export class SendmsgComponent implements OnInit {
  to: string = '';
  message: string = '';

  selectedProfile = {
    profileId: '',
    profileName: '',
    webhook_url: '',
  };

  from: string = '';
  profiles: any[] = [];
  phoneNumbers: any[] = [];

  constructor(private smsService: SmsService, private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.getMessagingProfiles().subscribe(
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
    if (!this.selectedProfile.profileId) return;

    const selected = this.profiles.find(profile => profile.id === this.selectedProfile.profileId);
    if (selected) {
      this.selectedProfile.profileName = selected.name;
      
      // Notify the sidebar about the selected profile
      this.profileService.setSelectedProfile(selected);

      // Fetch associated phone numbers
      this.profileService.getProfilesAssociatedPhonenumbers(this.selectedProfile.profileId).subscribe(
        (data) => {
          this.phoneNumbers = data.data || [];
          console.log('Associated Phone Numbers:', this.phoneNumbers);

          if (this.phoneNumbers.length > 0) {
            this.from = this.phoneNumbers[0].phone_number;
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

  sendMessage() {
    if (!this.from) {
      alert('Please select a phone number.');
      return;
    }

    if (!this.to) {
      alert('Please enter the recipient number.');
      return;
    }

    if (!this.message) {
      alert('Please enter the message.');
      return;
    }

    this.smsService.sendSms(this.to, this.from, this.selectedProfile.profileId, this.selectedProfile.webhook_url, this.message).subscribe(
      (response) => {
        console.log('Message sent successfully', response);
        alert('Message sent!');
      },
      (error) => {
        console.error('Error sending message', error);
        alert('Failed to send message.');
      }
    );
  }
}
