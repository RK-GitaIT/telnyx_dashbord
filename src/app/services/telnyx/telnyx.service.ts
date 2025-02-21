import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../config';
import { CallService } from '../call.service';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from '../../websocket/websoket.service';

export interface CallStatus {
  status: string;
  type: 'info' | 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class TelnyxService {
  private websocketUrl =
    'wss://telnyx-backend-ogru26phv-ram-gitaits-projects.vercel.app/api/webhook';
  private backendApi = environment.apiUrl; // Keeping old backend API URL
  message: string = '';
  callStatus$ = new BehaviorSubject<CallStatus>({ status: '', type: 'info' });
  error$ = new BehaviorSubject<string | null>(null);

  constructor(
    private callService: CallService,
    private http: HttpClient,
    private websocketService: WebsocketService
  ) {
    this.websocketService.message$.subscribe((res: any) =>
      this.handleWebSocketMessage(res)
    );
  }

  async makeCall(
    destinationNumber: string,
    callerNumber: string,
    connectionId: string,
    message: string
  ) {
    try {
      console.log(`📞 Calling ${destinationNumber} from ${callerNumber}`);
      const profileDetails = await this.callService
        .getProfilesAssociatedPhonenumbers(connectionId)
        .toPromise();
      if (!profileDetails?.data) throw new Error('Invalid profile details.');

      this.websocketService.connect(this.websocketUrl);
      this.message = message;

      const payload = {
        to: destinationNumber,
        from: callerNumber,
        from_display_name: 'Gita IT',
        connection_id: connectionId,
        webhook_url: this.websocketUrl,
        sip_auth_username: profileDetails.data.user_name,
        sip_auth_password: profileDetails.data.password,
      };

      this.callStatus$.next({ status: 'Calling...', type: 'info' });
      const response: any = await this.http
        .post(`${this.backendApi}/call`, payload)
        .toPromise();

      if (response?.message) {
        console.log('📞 Call initiated:', response.message);
      } else {
        console.error('❌ Call initiation failed.');
      }
    } catch (error: any) {
      this.endCall();
      console.error('🚨 Call Failed:', error.message);
      this.error$.next(`Call Error: ${error.message}`);
      this.callStatus$.next({ status: 'Call Failed', type: 'error' });
    }
  }

  private handleWebSocketMessage(res: any) {
    console.log('📩 WebSocket Message:', res);
    if (res?.call_control_id) {
      this.playTTS(res.call_control_id, this.message);
    } else {
      console.error('❌ Invalid WebSocket message.');
    }
  }
  // Find call control ID in the log file
  async FindCallIDinFile(callControlId: string): Promise<boolean> {
    try {
      const response = await fetch("https://gitait.com/TelnyxWebhookLog.txt");
      const data = await response.text();
      
      const lines = data.split('\n');
      
      const found = lines.some(line => line.includes(callControlId));
  
      if (found) {
        console.log("Call Control ID found in the file.");
      } else {
        console.log("Call Control ID not found in the file.");
      }
  
      return found; 
    } catch (error) {
      console.error("Error fetching or processing the file:", error);
      return false; // Return false if there is an error
    }
  }

  // Play TTS message
  async playTTS(callControlId: string, message: string) {
    try {
      const response = await this.http.post(
        `${environment.apiUrl}/calls/${callControlId}/actions/speak`,
        {
          payload: message,
          language: 'en-US',
          voice: 'female'
        }
      ).toPromise();

      console.log("TTS Playback Started:", response);

      // After TTS finishes, hang up the call
      this.hangUpCall(callControlId);

    } catch (error) {
      console.error("Error playing TTS:", error);
    }
  }

  // Hang up the call
  async hangUpCall(callControlId: string) {
    try {
      console.log(`Hanging up the call with Control ID: ${callControlId}`);
      
      const response = await this.http.post(
        `${environment.apiUrl}/calls/${callControlId}/actions/hangup`,
        {}
      ).toPromise();
      
      console.log("Call hung up successfully:", response);
      this.endCall();
    } catch (error) {
      console.error("Error hanging up the call:", error);
    }
  }

  // End the call in the UI
  endCall() {
    this.callStatus$.next({ status: 'Call Ended', type: 'success' });
    console.log("Call has ended.");
  }
}
