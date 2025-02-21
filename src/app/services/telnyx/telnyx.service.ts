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
  private client: any;
  message: string = '';
  callStatus$ = new BehaviorSubject<CallStatus>({ status: '', type: 'info' });
  error$ = new BehaviorSubject<string | null>(null);

  constructor(
    private callService: CallService,
    private http: HttpClient,
    private websocketService: WebsocketService
  ) {
    this.websocketService.message$.subscribe((res: any) => {
      this.handleWebSocketMessage(res);
    });
  }

  // Make the call and handle WebSocket messages
  async makeCall(destinationNumber: string, callerNumber: string, connectionId: string, message: string) {
    try {
      console.log(`📞 Attempting to call ${destinationNumber} from ${callerNumber}`);

      const profileDetails = await this.callService.getProfilesAssociatedPhonenumbers(connectionId).toPromise();
      if (profileDetails.data == null) throw new Error('Invalid profile details.');

      const websocketUrl = "wss://telnyx-dashbord-gitait-dev.vercel.app/websocket";
      this.websocketService.connect(websocketUrl);

      const payload = {
        to: destinationNumber,
        from: callerNumber,
        from_display_name: "Gita IT",
        connection_id: connectionId,
        webhook_url: websocketUrl,
        stream_url: websocketUrl,
        stream_track: "both_tracks",
        send_silence_when_idle: true,
        sip_auth_username: profileDetails.data.user_name,
        sip_auth_password: profileDetails.data.password
      };

      this.callStatus$.next({ status: 'Calling...', type: 'info' });
      const response: any = await this.http.post(`${environment.apiUrl}/calls`, payload).toPromise();

      if (response?.data?.call_control_id) {
        console.log("📞 Call Control ID:", response.data.call_control_id);
        this.playTTS(response.data.call_control_id, message);
      } else {
        console.error("❌ Call control ID missing.");
      }
    } catch (error: any) {
      this.endCall();
      console.error('🚨 Call Failed:', error.message);
      this.error$.next(`Call Error: ${error.message}`);
      this.callStatus$.next({ status: 'Call Failed', type: 'error' });
    }
  }

  private handleWebSocketMessage(res: any) {
    console.log("📩 WebSocket Message:", res);
    if (res?.call_control_id) {
      this.playTTS(res.call_control_id, this.message);
    } else {
      console.error("❌ Invalid WebSocket message.");
    }
  }

  async playTTS(callControlId: string, message: string) {
    try {
      await this.http.post(
        `${environment.apiUrl}/calls/${callControlId}/actions/speak`,
        { payload: message, language: 'en-US', voice: 'female' }
      ).toPromise();
      console.log("🔊 TTS Playback started.");
      this.hangUpCall(callControlId);
    } catch (error) {
      console.error("❌ Error playing TTS:", error);
    }
  }

  async hangUpCall(callControlId: string) {
    try {
      await this.http.post(`${environment.apiUrl}/calls/${callControlId}/actions/hangup`, {}).toPromise();
      console.log("📴 Call hung up successfully.");
      this.endCall();
    } catch (error) {
      console.error("❌ Error hanging up the call:", error);
    }
  }

  endCall() {
    this.callStatus$.next({ status: 'Call Ended', type: 'success' });
    console.log("📞✅ Call has ended.");
  }
}
