import { Component, ElementRef, ViewChild } from '@angular/core';
import { WebRTCService } from '../services/web-rtc.service';

@Component({
  selector: 'app-web-rtccall',
  imports: [],
  templateUrl: './web-rtccall.component.html',
  styleUrl: './web-rtccall.component.css'
})
export class WebRTCCallComponent {
  @ViewChild('remoteAudio') remoteAudio!: ElementRef<HTMLAudioElement>;

  constructor(private webRTCService: WebRTCService) {}

  async ngOnInit() {
    // Initialize the local audio stream on component load
    await this.webRTCService.initializeLocalStream();
  }

  async startCall() {
    // Create the peer connection and an SDP offer
    const offer = await this.webRTCService.createOffer();
    console.log('SDP Offer created:', offer);

    // TODO: Send the offer to the remote peer via your signaling server
    // and wait for an answer to be returned. Once the answer is received,
    // call this.webRTCService.createAnswer(offer) (or setRemoteDescription directly).
    
    // Additionally, subscribe or listen for remote tracks (via ontrack) in the service.
    // When a remote stream arrives, attach it to the audio element.
    // For example, if you pass the remote stream via a callback or Observable:
    // remoteStream => this.remoteAudio.nativeElement.srcObject = remoteStream;
  }

  endCall() {
    this.webRTCService.closeConnection();
  }
}
