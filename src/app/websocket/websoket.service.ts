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
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      this.handleMessage(event);
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

  private handleMessage(event: MessageEvent): void {
    const data = JSON.parse(event.data);
    this.messageSubject.next(data);
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
