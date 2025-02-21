import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

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
      console.log('🔌 WebSocket already connected.');
      return;
    }

    console.log(`🌐 Connecting to WebSocket: ${url}`);
    this.socket = new WebSocket(url);
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onclose = this.onClose.bind(this, url);
    this.socket.onerror = this.onError.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
  }

  private onOpen(): void {
    console.log('✅ WebSocket Connected');
    this.reconnectAttempts = 0;
  }

  private onClose(url: string): void {
    console.log('⚠️ WebSocket Closed');
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(url), 2000);
    } else {
      console.log('❌ Max reconnect attempts reached.');
    }
  }

  private onError(event: Event): void {
    console.error('🚨 WebSocket Error:', event);
  }

  private onMessage(event: MessageEvent): void {
    const message = JSON.parse(event.data);
    console.log('📩 Message received:', message);
    this.message$.next(message);
  }

  send(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('📤 Message sent:', message);
    } else {
      console.warn('⚡ WebSocket not open. Message not sent.');
    }
  }
}
