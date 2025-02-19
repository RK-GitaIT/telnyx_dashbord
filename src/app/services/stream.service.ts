import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private socket: WebSocket | null = null;

  /**
   * Connects to the streaming server via WebSocket.
   * @param streamUrl The WebSocket URL (e.g. wss://www.example.com/websocket)
   */
  connect(streamUrl: string): WebSocket {
    this.socket = new WebSocket(streamUrl);

    // Handle incoming messages (media packets)
    this.socket.onmessage = (message) => {
      // TODO: Process incoming media data
      console.log('Media message received:', message);
    };

    this.socket.onopen = () => {
      console.log('Connected to streaming server.');
    };

    this.socket.onerror = (error) => {
      console.error('Streaming error:', error);
    };

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
