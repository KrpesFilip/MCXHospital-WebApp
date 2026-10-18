import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { ConfigService } from './config.service';

export interface LocationMessage {
  type: string;
  data?: any;
  caseId?: number;
  latitude?: number;
  longitude?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  public ws: WebSocket | null = null;
  private messageSubject = new Subject<LocationMessage>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  constructor(private configService: ConfigService) {}

  connect(): Observable<LocationMessage> {
    this.configService.getConfig().subscribe(config => {
      this.establishConnection(config.Urls.wsUrl);
    });
    return this.messageSubject.asObservable();
  }

  private establishConnection(wsUrl: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const rawMessage = JSON.parse(event.data);
        
        if (rawMessage.type === 'LOCATION_UPDATE') {
          const message: LocationMessage = {
            type: rawMessage.type,
            caseId: rawMessage.caseId,
            latitude: rawMessage.latitude,
            longitude: rawMessage.longitude
          };
          this.messageSubject.next(message);
        } else {
          const message: LocationMessage = {
            type: rawMessage.action || rawMessage.type,
            data: rawMessage.case || rawMessage.data
          };
          this.messageSubject.next(message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      this.attemptReconnect(wsUrl);
    };
  }

  private attemptReconnect(wsUrl: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      timer(this.reconnectInterval).subscribe(() => {
        this.establishConnection(wsUrl);
      });
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.messageSubject.complete();
  }
}