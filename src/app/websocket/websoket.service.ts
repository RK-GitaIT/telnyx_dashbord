import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  public message$ = new BehaviorSubject<any>(null);

  constructor() {}

  connect(url: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected.');
      return;
    }

    this.socket = new WebSocket(url);
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    this.socket.onerror = this.onError.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
  }

  private onOpen(event: Event): void {
    console.log('WebSocket Connected');
    this.reconnectAttempts = 0;
  }

  private onClose(event: CloseEvent): void {
    console.log('WebSocket Closed:', event);
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log('Attempting to reconnect...');
      setTimeout(() => this.reconnect(), 2000); // Retry after 2 seconds
    } else {
      console.log('Max reconnect attempts reached.');
    }
  }

  private onError(event: Event): void {
    console.error('WebSocket Error:', event);
  }

  private onMessage(event: MessageEvent): void {
    const message = JSON.parse(event.data);
    console.log('Message from server:', message);
    this.message$.next(message);
  }

  private reconnect(): void {
    if (this.socket?.readyState === WebSocket.CLOSED) {
      this.reconnectAttempts++;
      this.connect('wss://telnyx-dashbord-gitait-dev.vercel.app/websocket');
    }
  }

  send(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.log('WebSocket is not open. Retry later.');
    }
  }
}
