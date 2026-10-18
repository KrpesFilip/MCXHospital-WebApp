import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { CaseModel } from '../hospital-models/case-model';

export interface WebSocketMessage {
  type: 'CREATE' | 'UPDATE' | 'ACKNOWLEDGE' | 'DELETE' | 'LOCATION_UPDATE' | 'END';
  data?: CaseModel;
  caseId?: number;
  latitude?: number;
  longitude?: number;
  etaMinutes?: number;
}

@Injectable({ providedIn: 'root' })
export class CaseWebSocketService {
  private configService = inject(ConfigService);
  private ws?: WebSocket;
  private reconnectInterval?: any;
  private reconnectDelay = 3000;

  // Subject for case update messages
  private messageSubject = new BehaviorSubject<WebSocketMessage | null>(null);
  public message$ = this.messageSubject.asObservable();

  // Subject for connection status
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  connect() {
    const wsUrl = this.configService.wsUrl;

    console.log('🔌 Connecting to WebSocket:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected to /ws/cases');
        this.connectedSubject.next(true);

        // Clear any reconnect attempts
        if (this.reconnectInterval) {
          clearTimeout(this.reconnectInterval);
          this.reconnectInterval = undefined;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message);
          this.messageSubject.next(message);
        } catch (e) {
          console.error('❌ Error parsing WebSocket message:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket closed, reconnecting in', this.reconnectDelay / 1000, 'seconds...');
        this.connectedSubject.next(false);

        // Auto-reconnect after delay
        this.reconnectInterval = setTimeout(() => {
          this.connect();
        }, this.reconnectDelay);
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.connectedSubject.next(false);
    }
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = undefined;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }

    this.connectedSubject.next(false);
  }

  
  //  Send a location update for a specific case
  sendLocationUpdate(caseId: number, latitude: number, longitude: number) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, cannot send location update');
      return;
    }

    const message = {
      type: 'LOCATION_UPDATE',
      caseId,
      latitude,
      longitude
    };

    console.log('📤 Sending location update:', message);
    this.ws.send(JSON.stringify(message));
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
