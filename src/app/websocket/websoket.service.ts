import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket!: WebSocket;
  private messageSubject = new BehaviorSubject<any>(null);
  public message$ = this.messageSubject.asObservable();

  constructor() {}

  connect(url: string): void {
    this.socket = new WebSocket(url);  // Establish WebSocket connection

    // Handle incoming messages
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received WebSocket message:", message);

      // Notify other parts of the application (e.g., TelnyxService)
      this.messageSubject.next(message);  // Emits message to listeners
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed', event);
    };
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
