import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CallService } from '../call.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../config';
import { WebsocketService } from '../../websocket/websoket.service';

export interface CallStatus {
  status: string;
  type: 'info' | 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class TelnyxService {
  // Update these URLs with your deployed server endpoint
  private websocketUrl = 'https://9bccfa7d-d274-4959-a8d9-3f291234fb15-00-2spvmgf4sg5r2.sisko.replit.dev/api/webhook';
  private webws = 'ws://9bccfa7d-d274-4959-a8d9-3f291234fb15-00-2spvmgf4sg5r2.sisko.replit.dev/api/webhook';
  private backendApi = environment.apiUrl;
  
  message: string = '';
  callStatus$ = new BehaviorSubject<CallStatus>({ status: '', type: 'info' });
  
  constructor(
    private callService: CallService,
    private http: HttpClient,
    private websocketService: WebsocketService
  ) {
    // Subscribe to WebSocket messages
    this.websocketService.message$.subscribe((res: any) => this.handleWebSocketMessage(res));
  }

  async makeCall(
    destinationNumber: string,
    callerNumber: string,
    connectionId: string,
    message: string
  ) {
    try {
      console.log(`Attempting to call ${destinationNumber} from ${callerNumber} (ID: ${connectionId})`);
      
      const profileDetails = await this.callService.getProfilesAssociatedPhonenumbers(connectionId).toPromise();
      console.log('Profile details:', profileDetails.data);
      if (!profileDetails.data) {
        throw new Error('Invalid profile details');
      }
      
      // Connect to WebSocket (disconnecting if already connected)
      this.websocketService.connect(this.webws);
      this.message = message;
      
      const apiUrl = `${this.backendApi}/calls`;
      const payload = {
        to: destinationNumber,
        from: callerNumber,
        from_display_name: "Gita IT",
        connection_id: connectionId,
        webhook_url: this.websocketUrl,
        stream_track: "both_tracks",
        send_silence_when_idle: true,
        sip_auth_username: profileDetails.data.user_name,
        sip_auth_password: profileDetails.data.password
      };
      
      // Update call status to indicate call initiation
      this.callStatus$.next({ status: 'Call Initiated', type: 'success' });
      
      this.http.post(apiUrl, payload).subscribe(
        (response: any) => {
          console.log('API call success:', response);
          if (response && response.data && response.data.call_control_id) {
            const callControlId = response.data.call_control_id;
            console.log("Call Control ID:", callControlId);
          } else {
            console.error("Call control ID missing in response");
            this.handleCallError(new Error("Call control ID missing"));
          }
        },
        (error) => {
          console.error('API call error:', error);
          this.handleCallError(error);
        }
      );
      
    } catch (error: any) {
      console.error('Call failed:', error);
      this.handleCallError(error);
    }
  }

  private handleWebSocketMessage(res: any) {
    console.log('WebSocket Message:', res);
    // When a "call.answered" event is received, update status and play TTS
    if (res?.data && res.data.payload && res.data.event_type === 'call.answered') {
      this.callStatus$.next({ status: 'Call Answered', type: 'success' });
      this.playTTS(res.data.payload.call_control_id, this.message);
    }
  }

  async playTTS(callControlId: string, message: string) {
    try {
      this.callStatus$.next({ status: 'Playing TTS', type: 'info' });
      const response = await this.http.post(
        `${environment.apiUrl}/calls/${callControlId}/actions/speak`,
        {
          payload: message,
          language: 'en-US',
          voice: 'female'
        }
      ).toPromise();
      console.log("TTS Playback Started:", response);
      // TTS played successfully – show success toast and then hang up
      this.callStatus$.next({ status: 'TTS Playback Started', type: 'success' });
      this.hangUpCall(callControlId);
    } catch (error) {
      console.error("Error playing TTS:", error);
      // On error, update status to "TTS Not Sent" so that an error toast is shown
      this.callStatus$.next({ status: 'TTS Not Sent', type: 'error' });
      this.hangUpCall(callControlId);
    }
  }

  async hangUpCall(callControlId: string) {
    try {
      this.callStatus$.next({ status: 'Hanging Up', type: 'info' });
      console.log(`Hanging up call (ID: ${callControlId})`);
      const response = await this.http.post(
        `${environment.apiUrl}/calls/${callControlId}/actions/hangup`,
        {}
      ).toPromise();
      console.log("Call Hung Up:", response);
      // When a call ends normally, update status as "Call Ended" (red color)
      this.callStatus$.next({ status: 'Call Ended', type: 'error' });
      this.endCall();
    } catch (error) {
      console.error("Error hanging up call:", error);
      this.handleCallError(error);
    }
  }

  private handleCallError(error: any) {
    console.error('Call Failed:', error.message || error);
    // Play beep sound on error
    this.playBeepSound();
    // Update call status to indicate failure (this will show an error toast)
    this.callStatus$.next({ status: 'Call Failed', type: 'error' });
    this.endCall();
  }

  private playBeepSound() {
    const beep = new Audio('assets/beep.mp3');
    beep.play().catch(err => console.error('Error playing beep sound:', err));
  }

  endCall() {
    this.callStatus$.next({ status: 'Call Ended', type: 'error' });
    console.log("Call has ended.");
    this.websocketService.disconnect();
  }
}
