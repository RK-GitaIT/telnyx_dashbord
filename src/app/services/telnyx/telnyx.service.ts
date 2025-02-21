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
  ) {
    // Subscribe to WebSocket messages
    this.websocketService.message$.subscribe((res: any) => {
      this.handleWebSocketMessage(res); // Handle message when received
    });
  }

  // Make the call and handle WebSocket messages
  async makeCall(destinationNumber: string, callerNumber: string, connectionId: string, message: string) {
    try {
      console.log(`📞 Attempting to call ${destinationNumber} from ${callerNumber} using connection ID: ${connectionId}`);

      const profileDetails = await this.callService.getProfilesAssociatedPhonenumbers(connectionId).toPromise();
      console.log(profileDetails.data);
      if (profileDetails.data == null) {
        throw new Error('Invalid profile details: Missing username or password.');
      }

      // WebSocket URL for handling call events
      const websocketUrl = "https://telnyx-dashbord-gitait-dev.vercel.app/webhook";
      
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

      var res = this.http.post(apiUrl, payload);
      res.subscribe(
        async (response: any) => {  
          console.log(response, "API call success");

          // Ensure the response has the expected structure
          if (response && response.data && response.data.call_control_id) {
            const callControlId = response.data.call_control_id;
            console.log("Call Control ID:", callControlId);

            // Wait for the call control ID to be found in the file before proceeding
            // let intervelcall = false;
            // while (!intervelcall) {
            //   intervelcall = await this.FindCallIDinFile(callControlId);  // Use await here to properly wait
            //   if (!intervelcall) {
            //     await new Promise(resolve => setTimeout(resolve, 2000));  // Delay 2 seconds before retrying
            //   }
            // }

            // // Proceed once the ID is found in the file
            // this.playTTS(callControlId, 'Processing your call...');
            
          } else {
            console.error("Error: Call control ID is missing in the response data");
          }
        },
        (error) => {
          console.error(error, "API call error");
        }
      );
      
    } catch (error: any) {
      this.endCall();
      console.error('🚨 Call Failed:', error.message || error);
      this.error$.next(`Call Error: ${error.message || 'Unknown error'}`);
      this.callStatus$.next({ status: 'Call Failed', type: 'error' });
    }
  }

  // Handling WebSocket messages
  private handleWebSocketMessage(res: any) {
    console.log("WebSocket Message Received:", res);

    // Check if the message contains call control ID or relevant data
    if (res && res.call_control_id) {
      console.log("Processing WebSocket message for call control ID:", res.call_control_id);
      this.playTTS(res.call_control_id, this.message);
    } else {
      console.error("Invalid message received, missing call control ID.");
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
