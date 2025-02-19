import { Component, ElementRef, ViewChild } from '@angular/core';
import { CallService } from '../services/call.service';
import { WebRTCService } from '../services/web-rtc.service';
import { StreamService } from '../services/stream.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dial-pad',
  imports: [FormsModule, CommonModule],
  templateUrl: './dial-pad.component.html',
  styleUrls: ['./dial-pad.component.css']
})
export class DialPadComponent {
  dialedNumber: string = '';
  callLegId: string | null = null;
  callStatus: string = 'idle'; 
  isMuted: boolean = false;
  isOnHold: boolean = false;
  from: string = '';
  profiles: any[] = [];
  phoneNumbers: any[] = [];

  selectedProfile = {
    id: '',
    profileName: '',
    webhook_event_url: '',
  };

  // Reference to the audio element for playing remote audio
  @ViewChild('remoteAudio') remoteAudio!: ElementRef<HTMLAudioElement>;

  constructor(
    private callService: CallService,
    private webRTCService: WebRTCService,
    private streamService: StreamService
  ) {}

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

    // Initialize local audio stream for WebRTC
    await this.webRTCService.initializeLocalStream();

    // Set a handler to attach the remote stream to our audio element when received
    this.webRTCService.setRemoteStreamHandler((stream: MediaStream) => {
      if (this.remoteAudio && this.remoteAudio.nativeElement) {
        this.remoteAudio.nativeElement.srcObject = stream;
      }
    });
  }

  onProfileChange() {
    if (!this.selectedProfile.id) return;

    const selected = this.profiles.find(
      (profile) => profile.id === this.selectedProfile.id
    );
    if (selected) {
      this.selectedProfile.profileName = selected.connection_name;

      // Fetch associated phone numbers
      this.callService
        .getProfilesAssociatedPhonenumbers(this.selectedProfile.id)
        .subscribe(
          (data) => {
            this.phoneNumbers = data.data || [];
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

  // Append digit to dialed number
  addToDialedNumber(value: string): void {
    this.dialedNumber += value;
  }

  // Clear the dialed number
  clearAll(): void {
    this.dialedNumber = '';
  }

  // Delete last digit
  deleteLastDigit(): void {
    this.dialedNumber = this.dialedNumber.slice(0, -1);
  }

  // When the user clicks "Dial", initiate the Telnyx call,
  // connect to the streaming server, and start the WebRTC offer
  async dialNumber(): Promise<void> {
    if (!this.dialedNumber) return;
    console.log(this.dialedNumber, this.selectedProfile.webhook_event_url, "dial click");

    // Initiate call via the backend CallService
    this.callService.dialNumber(
      this.dialedNumber,
      this.from,
      this.selectedProfile.id,
      this.selectedProfile.webhook_event_url
    ).subscribe(
      async (response) => {
        this.callLegId = response.data.call_leg_id;
        this.callStatus = 'ringing';
        console.log('Call initiated:', response);

        // Connect to the streaming server using StreamService
        // (The stream_url must match the one sent in your payload)
        this.streamService.connect("wss://https://telnyx-dashbord-gitait-dev.vercel.app/websocket");

        // Create an SDP offer for the WebRTC connection
        try {
          const offer = await this.webRTCService.createOffer();
          console.log('WebRTC Offer created:', offer);
          // TODO: Send the SDP offer via your signaling server to the remote peer
        } catch (err) {
          console.error('Error creating WebRTC offer:', err);
        }
      },
      (error) => {
        console.error('Dial error:', error);
      }
    );
  }

  answerCall(): void {
    if (!this.callLegId) return;
    this.callService.answerCall(this.callLegId).subscribe(
      (response) => {
        this.callStatus = 'in-call';
        console.log('Call answered:', response);
        // TODO: Process the remote SDP answer via your signaling mechanism
      },
      (error) => {
        console.error('Answer error:', error);
      }
    );
  }

  hangUpCall(): void {
    if (!this.callLegId) return;
    this.callService.hangUpCall(this.callLegId).subscribe(
      (response) => {
        this.callStatus = 'idle';
        this.callLegId = null;
        this.isMuted = false;
        this.isOnHold = false;
        console.log('Call ended:', response);
        this.webRTCService.closeConnection();
        this.streamService.disconnect();
      },
      (error) => {
        console.error('Hangup error:', error);
      }
    );
  }

  muteCall(): void {
    if (!this.callLegId) return;
    this.callService.muteCall(this.callLegId).subscribe(
      (response) => {
        this.isMuted = true;
        console.log('Call muted:', response);
      },
      (error) => {
        console.error('Mute error:', error);
      }
    );
  }

  unmuteCall(): void {
    if (!this.callLegId) return;
    this.callService.unmuteCall(this.callLegId).subscribe(
      (response) => {
        this.isMuted = false;
        console.log('Call unmuted:', response);
      },
      (error) => {
        console.error('Unmute error:', error);
      }
    );
  }

  holdCall(): void {
    if (!this.callLegId) return;
    this.callService.holdCall(this.callLegId).subscribe(
      (response) => {
        this.isOnHold = true;
        console.log('Call on hold:', response);
      },
      (error) => {
        console.error('Hold error:', error);
      }
    );
  }

  resumeCall(): void {
    if (!this.callLegId) return;
    this.callService.resumeCall(this.callLegId).subscribe(
      (response) => {
        this.isOnHold = false;
        console.log('Call resumed:', response);
      },
      (error) => {
        console.error('Resume error:', error);
      }
    );
  }
}
