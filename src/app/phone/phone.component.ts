import { Component, ElementRef, ViewChild } from '@angular/core';
import { TelnyxService } from '../services/telnyx/telnyx.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CallService } from '../services/call.service';
import { WebRTCService } from '../services/web-rtc.service';
import { StreamService } from '../services/stream.service';

@Component({
  selector: 'app-phone',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.css']
})
export class PhoneComponent {
  dialNumber = '';
  isMuted = false;
  isOnHold = false;
  isCalling = false;
  isRinging = false;
  callStatus = '';
  errorMessage = '';

  from: string = '';
  profiles: any[] = [];
  phoneNumbers: any[] = [];

  selectedProfile = {
    id: '',
    profileName: '',
    webhook_event_url: '',
  };

  @ViewChild('remoteAudio') remoteAudio!: ElementRef<HTMLAudioElement>;

  // Audio Elements for Beep & Ringtone
  private beepSound = new Audio('assets/beep.mp3');
  private ringtone = new Audio('assets/ringtone.mp3');

  constructor(
    private telnyxService: TelnyxService,
    private callService: CallService,
    private webRTCService: WebRTCService,
    private streamService: StreamService
  ) {
    this.telnyxService.callStatus$.subscribe(status => this.callStatus = status);
    this.telnyxService.error$.subscribe(error => this.errorMessage = error ? `Error: ${error}` : '');
  }

  async ngOnInit() {
    this.callService.callProfiles().subscribe(
      (data) => {
        this.profiles = data.data;
      },
      (error) => {
        console.error('Error fetching profiles', error);
      }
    );

    await this.webRTCService.initializeLocalStream();

    this.webRTCService.setRemoteStreamHandler((stream: MediaStream) => {
      if (this.remoteAudio && this.remoteAudio.nativeElement) {
        this.remoteAudio.nativeElement.srcObject = stream;
      }
    });

    // Configure the ringtone to loop
    this.ringtone.loop = true;
  }

  onProfileChange() {
    if (!this.selectedProfile.id) return;
  
    const selected = this.profiles.find(profile => profile.id === this.selectedProfile.id);
    if (selected) {
      this.selectedProfile.profileName = selected.connection_name;
  
      this.callService.getProfilesAssociatedPhonenumbers(this.selectedProfile.id).subscribe(
        (data) => {
          this.phoneNumbers = data.data || [];
          this.from = this.phoneNumbers.length > 0 ? this.phoneNumbers[0].phone_number : '';
        },
        (error) => console.error('Error fetching associated phone numbers', error)
      );
    }
  }

  appendDigit(digit: string) {
    this.dialNumber += digit;
    
    // Play beep sound on digit click
    this.beepSound.currentTime = 0;  // Restart sound
    this.beepSound.play();
  }

  deleteLastDigit() {
    this.dialNumber = this.dialNumber.slice(0, -1);
  }

  makeCall() {
    if (this.dialNumber.trim() === '' || !this.selectedProfile.id) return;
    this.isCalling = true;

    // Start ringtone
    this.ringtone.play();

    this.telnyxService.makeCall(this.dialNumber, this.from, this.selectedProfile.id)
      .then(() => {
        console.log('Call started successfully');
        
        // Stop ringtone once the call connects
        this.ringtone.pause();
        this.ringtone.currentTime = 0;
      })
      .catch(error => {
        console.error('Error starting call:', error);
        this.isCalling = false;
        this.errorMessage = error.message || 'Call failed';

        // Stop ringtone if call fails
        this.ringtone.pause();
        this.ringtone.currentTime = 0;
      });
  }

  endCall() {
    this.isCalling = false;
    this.telnyxService.endCall();

    // Stop ringtone when call ends
    this.ringtone.pause();
    this.ringtone.currentTime = 0;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.isMuted ? this.telnyxService.muteCall() : this.telnyxService.unmuteCall();
  }

  toggleHold() {
    this.isOnHold = !this.isOnHold;
    this.isOnHold ? this.telnyxService.holdCall() : this.telnyxService.resumeCall();
  }

  answerCall() {
    this.isRinging = false;
    this.isCalling = true;
    this.telnyxService.answerCall();

    // Stop ringtone when answering
    this.ringtone.pause();
    this.ringtone.currentTime = 0;
  }
}
