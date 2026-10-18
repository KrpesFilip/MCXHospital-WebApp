import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export interface RemoteLocation {
  caseId: number;
  latitude: number;
  longitude: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class WebSocketLocationService {

  private ws?: WebSocket;
  private remoteLocationsSubject = new BehaviorSubject<RemoteLocation[]>([]);
  public remoteLocations$ = this.remoteLocationsSubject.asObservable();

  private pollInterval?: number;

  connect(token: string) {
    const wsUrl = `ws://localhost:8080/ws/location?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const update: RemoteLocation = JSON.parse(event.data);
        this.updateRemoteLocations(update);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    this.ws.onerror = (error) => console.error('WebSocket error:', error);

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      if (this.pollInterval) clearInterval(this.pollInterval);
    };
  }

  disconnect() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.ws) this.ws.close();
  }


  private updateRemoteLocations(update: RemoteLocation) {
    const current = this.remoteLocationsSubject.value;
    const idx = current.findIndex((l) => l.caseId === update.caseId);

    if (idx >= 0) {
      current[idx] = update;
    } else {
      current.push(update);
    }

    this.remoteLocationsSubject.next([...current]);
  }
}