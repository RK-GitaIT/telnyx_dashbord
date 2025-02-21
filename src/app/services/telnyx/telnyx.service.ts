import { Injectable } from '@angular/core';
import { TelnyxRTC } from '@telnyx/webrtc';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../config';
import { CallService } from '../call.service';
import { HttpClient } from '@angular/common/http';

export interface CallStatus {
  status: string;
  type: 'info' | 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class TelnyxService {
  private client: any;
  private activeCall: any;
  message: string = '';

  // callStatus$ now holds an object with status and type.
  callStatus$ = new BehaviorSubject<CallStatus>({ status: '', type: 'info' });
  error$ = new BehaviorSubject<string | null>(null);

  constructor(private callService: CallService, private http: HttpClient) {}

  private async initializeClient(authToken: string, login?: string, password?: string): Promise<void> {
    try {
      if (this.client) {
        console.warn('⚠️ Disconnecting previous Telnyx client before reconnecting...');
        this.client.disconnect();
      }

      return new Promise((resolve, reject) => {
        console.log('🟡 Initializing Telnyx Client...');
        this.client = new TelnyxRTC({
          login_token: authToken,
          ...(login && password ? { login, password } : {}),
        });

        this.client.remoteElement = 'remoteMedia';
        this.client.connect();

        this.client.on('telnyx.ready', () => {
          console.log('✅ Telnyx Connected Successfully');
          this.callStatus$.next({ status: 'Connected', type: 'success' });
          resolve();
        });

        this.client.on('telnyx.error', (error: any) => {
          console.error('🚨 Telnyx Error:', error);
          this.error$.next(`Telnyx Error: ${error.message || 'Unknown error occurred'}`);
          this.callStatus$.next({ status: 'Telnyx Error', type: 'error' });
          reject(error);
        });

        this.client.on('telnyx.notification', (notification: any) => {
          if (notification.type === 'callUpdate') {
            this.activeCall = notification.call;
            this.handleCallState(notification.call, notification.call.callControlId);
          }
        });

        this.client.on('telnyx.socket.close', () => {
          console.warn('⚠️ Telnyx WebSocket Connection Closed.');
          this.callStatus$.next({ status: 'Connection Lost', type: 'error' });
        });

        this.client.on('telnyx.socket.error', (error: any) => {
          console.error('❌ WebSocket Error:', error);
          this.callStatus$.next({ status: 'WebSocket Error', type: 'error' });
        });
      });
    } catch (error) {
      console.error('🛑 Initialization Failed:', error);
      this.error$.next('Client initialization failed.');
      throw error;
    }
  }

  async makeCall(destinationNumber: string, callerNumber: string, connectionId: string, message: string) {
    try {
      console.log(`📞 Attempting to call ${destinationNumber} from ${callerNumber} using connection ID: ${connectionId}`);

      const profileDetails = await this.callService.getProfileFullDetails(connectionId).toPromise();
      console.log(profileDetails.data);
      if (profileDetails.data == null) {
        throw new Error('Invalid profile details: Missing username or password.');
      }

      console.log(80, "line calling");
      await this.initializeClient(environment.authToken, profileDetails.data.user_name, profileDetails.data.password);

      console.log('📡 Starting a new call...');
      this.activeCall = this.client.newCall({
        destinationNumber,
        callerNumber,
        forceRelayCandidate: false,
        debug: true,
        //debugOutput: 'socket',
        //localElement: "localVideo",
        //remoteElement: "remoteVideo",
      });

      this.callStatus$.next({ status: 'Calling...', type: 'info' });
    } catch (error: any) {
      console.error('🚨 Call Failed:', error.message || error);
      this.error$.next(`Call Error: ${error.message || 'Unknown error'}`);
      this.callStatus$.next({ status: 'Call Failed', type: 'error' });
    }
  }

  endCall() {
    try {
      if (!this.activeCall) {
        console.warn('⚠️ No active call to end.');
        return;
      }

      console.log('🔴 Ending Call...');
      this.activeCall.hangup();
      this.callStatus$.next({ status: 'Call Ended', type: 'info' });
    } catch (error) {
      console.error('🚨 Error Ending Call:', error);
      this.error$.next('Error ending call.');
      this.callStatus$.next({ status: 'Error Ending Call', type: 'error' });
    }
  }

  muteCall() {
    try {
      if (!this.activeCall) {
        console.warn('⚠️ No active call to mute.');
        return;
      }

      console.log('🔇 Muting Call...');
      this.activeCall.muteAudio();
      this.callStatus$.next({ status: 'Muted', type: 'info' });
    } catch (error) {
      console.error('🚨 Error Muting Call:', error);
      this.error$.next('Error muting call.');
      this.callStatus$.next({ status: 'Error Muting Call', type: 'error' });
    }
  }

  unmuteCall() {
    try {
      if (!this.activeCall) {
        console.warn('⚠️ No active call to unmute.');
        return;
      }

      console.log('🔊 Unmuting Call...');
      this.activeCall.unmuteAudio();
      this.callStatus$.next({ status: 'Unmuted', type: 'info' });
    } catch (error) {
      console.error('🚨 Error Unmuting Call:', error);
      this.error$.next('Error unmuting call.');
      this.callStatus$.next({ status: 'Error Unmuting Call', type: 'error' });
    }
  }

  holdCall() {
    try {
      if (!this.activeCall) {
        console.warn('⚠️ No active call to put on hold.');
        return;
      }

      console.log('⏸️ Putting Call on Hold...');
      this.activeCall.hold();
      this.callStatus$.next({ status: 'On Hold', type: 'info' });
    } catch (error) {
      console.error('🚨 Error Holding Call:', error);
      this.error$.next('Error putting call on hold.');
      this.callStatus$.next({ status: 'Error Putting Call on Hold', type: 'error' });
    }
  }

  resumeCall() {
    try {
      if (!this.activeCall) {
        console.warn('⚠️ No active call to resume.');
        return;
      }

      console.log('▶️ Resuming Call...');
      this.activeCall.unhold();
      this.callStatus$.next({ status: 'Resumed', type: 'info' });
    } catch (error) {
      console.error('🚨 Error Resuming Call:', error);
      this.error$.next('Error resuming call.');
      this.callStatus$.next({ status: 'Error Resuming Call', type: 'error' });
    }
  }

  answerCall() {
    try {
      if (!this.activeCall) {
        console.warn('⚠️ No incoming call to answer.');
        return;
      }

      console.log('✅ Answering Incoming Call...');
      this.activeCall.answer();
      this.callStatus$.next({ status: 'Call Answered', type: 'success' });
    } catch (error) {
      console.error('🚨 Error Answering Call:', error);
      this.error$.next('Error answering call.');
      this.callStatus$.next({ status: 'Error Answering Call', type: 'error' });
    }
  }

  private handleCallState(call: any, connectionId: any) {
    switch (call.state) {
      case 'ringing':
        console.log('📞 Incoming call is ringing...');
        this.callStatus$.next({ status: 'Incoming Call...', type: 'info' });
        break;
      case 'active':
        console.log('🟢 Call is active.');
        this.callStatus$.next({ status: 'Call Active', type: 'success' });
        this.playTTS(connectionId, this.message);
        break;
      case 'ended':
        console.log('🔴 Call has ended.');
        this.callStatus$.next({ status: 'Call Ended', type: 'info' });
        break;
      case 'disconnected':
        console.warn('⚠️ Call was disconnected.');
        this.callStatus$.next({ status: 'Call Disconnected', type: 'error' });
        break;
      default:
        console.warn(`❔ Unknown Call State: ${call.state}`);
        this.callStatus$.next({ status: 'Unknown State', type: 'error' });
    }
  }

  async playTTS(callControlId: string, message: string) {
    try {
      const response = await this.http.post(
        `$${environment.apiUrl}/calls/${callControlId}/actions/speak`,
        {
          payload: message,
          language: 'en-US',
          voice: 'female'
        }
      );
      console.log("TTS Playback Started:", response.subscribe(a => a));
    } catch (error) {
      console.error("Error playing TTS:", error);
    }
  }
}
