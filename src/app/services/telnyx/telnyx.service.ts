import { Injectable } from '@angular/core';
import { TelnyxRTC } from '@telnyx/webrtc';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../config';
import { CallService } from '../call.service';

@Injectable({ providedIn: 'root' })
export class TelnyxService {
  private client: any;
  private activeCall: any;

  callStatus$ = new BehaviorSubject<string>('');
  error$ = new BehaviorSubject<string | null>(null);

  constructor(private callService: CallService) {}

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
          this.callStatus$.next('Connected');
          resolve();
        });

        this.client.on('telnyx.error', (error: any) => {
          console.error('🚨 Telnyx Error:', error);
          this.error$.next(`Telnyx Error: ${error.message || 'Unknown error occurred'}`);
          reject(error);
        });

        this.client.on('telnyx.notification', (notification: any) => {
          if (notification.type === 'callUpdate') {
            this.activeCall = notification.call;
            this.handleCallState(notification.call);
          }
        });

        this.client.on('telnyx.socket.close', () => {
          console.warn('⚠️ Telnyx WebSocket Connection Closed.');
          this.callStatus$.next('Connection Lost');
        });

        this.client.on('telnyx.socket.error', (error: any) => {
          console.error('❌ WebSocket Error:', error);
          this.callStatus$.next('WebSocket Error');
        });
      });
    } catch (error) {
      console.error('🛑 Initialization Failed:', error);
      this.error$.next('Client initialization failed.');
      throw error;
    }
  }

  async makeCall(destination: string, callerNumber: string, connectionId: string): Promise<void> {
    try {
      console.log(`📞 Attempting to call ${destination} from ${callerNumber} using connection ID: ${connectionId}`);

      const profileDetails = await this.callService.getProfileFullDetails(connectionId).toPromise();
      console.log(profileDetails.data);
      if (profileDetails.data == null) {
        throw new Error('Invalid profile details: Missing username or password.');
      }

      console.log(80, "line calling");
      await this.initializeClient(environment.authToken, profileDetails.data.user_name, profileDetails.data.password);

      console.log('📡 Starting a new call...');
      this.activeCall = this.client.newCall({
        destinationNumber: destination,
        callerNumber: callerNumber,
      });

      this.callStatus$.next('Calling...');
    } catch (error: any) {
      console.error('🚨 Call Failed:', error.message || error);
      this.error$.next(`Call Error: ${error.message || 'Unknown error'}`);
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
      this.callStatus$.next('Call Ended');
    } catch (error) {
      console.error('🚨 Error Ending Call:', error);
      this.error$.next('Error ending call.');
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
      this.callStatus$.next('Muted');
    } catch (error) {
      console.error('🚨 Error Muting Call:', error);
      this.error$.next('Error muting call.');
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
      this.callStatus$.next('Unmuted');
    } catch (error) {
      console.error('🚨 Error Unmuting Call:', error);
      this.error$.next('Error unmuting call.');
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
      this.callStatus$.next('On Hold');
    } catch (error) {
      console.error('🚨 Error Holding Call:', error);
      this.error$.next('Error putting call on hold.');
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
      this.callStatus$.next('Resumed');
    } catch (error) {
      console.error('🚨 Error Resuming Call:', error);
      this.error$.next('Error resuming call.');
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
      this.callStatus$.next('Call Answered');
    } catch (error) {
      console.error('🚨 Error Answering Call:', error);
      this.error$.next('Error answering call.');
    }
  }

  private handleCallState(call: any) {
    switch (call.state) {
      case 'ringing':
        console.log('📞 Incoming call is ringing...');
        this.callStatus$.next('Incoming Call...');
        break;
      case 'active':
        console.log('🟢 Call is active.');
        this.callStatus$.next('Call Active');
        break;
      case 'ended':
        console.log('🔴 Call has ended.');
        this.callStatus$.next('Call Ended');
        break;
      case 'disconnected':
        console.warn('⚠️ Call was disconnected.');
        this.callStatus$.next('Call Disconnected');
        break;
      default:
        console.warn(`❔ Unknown Call State: ${call.state}`);
        this.callStatus$.next('Unknown State');
    }
  }
}
