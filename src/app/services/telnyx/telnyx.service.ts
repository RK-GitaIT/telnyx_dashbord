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

  // callStatus$ now holds an object with status and type.
  callStatus$ = new BehaviorSubject<CallStatus>({ status: '', type: 'info' });
  error$ = new BehaviorSubject<string | null>(null);

  constructor(
    private callService: CallService, 
    private http: HttpClient,
    private websocketService: WebsocketService  // Inject WebSocket service here
  ) {}

  async makeCall(destinationNumber: string, callerNumber: string, connectionId: string, message: string) {
    try {
      console.log(`📞 Attempting to call ${destinationNumber} from ${callerNumber} using connection ID: ${connectionId}`);

      const profileDetails = await this.callService.getProfileFullDetails(connectionId).toPromise();
      console.log(profileDetails.data);
      if (profileDetails.data == null) {
        throw new Error('Invalid profile details: Missing username or password.');
      }

      // WebSocket URL for handling call events
      const websocketUrl = "wss://telnyx-dashbord-gitait-dev.vercel.app/websocket";
      
      // Connect WebSocket
      this.websocketService.connect(websocketUrl);  // Start WebSocket connection

      // Webhook URL setup
      const webhookUrl = websocketUrl;  // Using WebSocket URL here as webhook URL

      var apiUrl = environment.apiUrl + "/calls";

      const payload = {
        to: destinationNumber,
        from: callerNumber,
        from_display_name: "Gita IT",
        connection_id: connectionId,
        webhook_url: webhookUrl,  // Set webhook URL (this is the URL where Telnyx will send call events)
        stream_url: "wss://telnyx-dashbord-gitait-dev.vercel.app/websocket",  // WebSocket URL for call stream
        stream_track: "both_tracks",  
        send_silence_when_idle: true,
        sip_auth_username: profileDetails.data.user_name,
        sip_auth_password: profileDetails.data.password
      };

      this.callStatus$.next({ status: 'Calling...', type: 'info' });

      // Make the API call to start the call
      var res = this.http.post(apiUrl, payload);
      res.subscribe(a => {
        console.log(a, "Api calling 106 line make call success");
      }, error => {
        console.log(error, "Api calling 106 line make call error");
      });

    } catch (error: any) {
      this.endCall();
      console.error('🚨 Call Failed:', error.message || error);
      this.error$.next(`Call Error: ${error.message || 'Unknown error'}`);
      this.callStatus$.next({ status: 'Call Failed', type: 'error' });
    }
  }

  async playTTS(callControlId: string, message: string) {
    try {
      const response = await this.http.post(
        `${environment.apiUrl}/calls/${callControlId}/actions/speak`,
        {
          payload: message,
          language: 'en-US',
          voice: 'female'
        }
      );

      response.subscribe(a => {
        console.log("TTS Playback Started:", a );
      }, error=> {
        console.log("error TTs Playing", error);
      });
      
    } catch (error) {
      console.error("Error playing TTS:", error);
    }
  }

  endCall() {
    this.callStatus$.next({ status: 'Call Ended', type: 'success' });
    console.log("Call has ended.");
  }
}
