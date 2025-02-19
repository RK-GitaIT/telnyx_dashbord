import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  private localStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private remoteStreamHandler: ((stream: MediaStream) => void) | null = null;

  // STUN server configuration – add TURN servers if needed
  private config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  async initializeLocalStream(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing audio devices:', error);
      throw error;
    }
  }

  async createPeerConnection(): Promise<RTCPeerConnection> {
    this.peerConnection = new RTCPeerConnection(this.config);

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // When a remote track is received, trigger the registered handler
    this.peerConnection.ontrack = (event) => {
      console.log('Remote stream received:', event.streams);
      if (this.remoteStreamHandler && event.streams && event.streams[0]) {
        this.remoteStreamHandler(event.streams[0]);
      }
    };

    // Handle ICE candidates (send them to your signaling server)
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate);
        // TODO: Send candidate via your signaling server
      }
    };

    return this.peerConnection;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      await this.createPeerConnection();
    }
    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    return offer;
  }

  async setRemoteDescription(desc: RTCSessionDescriptionInit) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(desc);
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(candidate);
    }
  }

  setRemoteStreamHandler(callback: (stream: MediaStream) => void) {
    this.remoteStreamHandler = callback;
  }

  closeConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}
