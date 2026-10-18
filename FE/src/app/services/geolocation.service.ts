import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { WebSocketService } from './websocket.service';

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private currentLocation$ = new BehaviorSubject<LocationData | null>(null);
  private trackingSubscription: Subscription | null = null;
  private watchId: number | null = null;
  private activeCaseId: number | null = null;

  constructor(private webSocketService: WebSocketService) {}

  getCurrentLocation(): Observable<LocationData | null> {
    return this.currentLocation$.asObservable();
  }

  startTracking(caseId: number): void {
    if (this.trackingSubscription) {
      return;
    }

    this.activeCaseId = caseId;

    if (!navigator.geolocation) {
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now()
        };
        
        this.currentLocation$.next(locationData);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    this.trackingSubscription = interval(2500).subscribe(() => {
      const location = this.currentLocation$.value;
      if (location && this.activeCaseId) {
        this.sendLocationUpdate(this.activeCaseId, location);
      }
    });
  }

  stopTracking(): void {
    if (this.trackingSubscription) {
      this.trackingSubscription.unsubscribe();
      this.trackingSubscription = null;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.activeCaseId = null;
    this.currentLocation$.next(null);
  }

  private sendLocationUpdate(caseId: number, location: LocationData): void {
    const message = {
      type: 'LOCATION_UPDATE',
      caseId: caseId,
      latitude: Number(location.latitude.toFixed(6)),
      longitude: Number(location.longitude.toFixed(6))
    };

    const ws = (this.webSocketService as any).ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  isTracking(): boolean {
    return this.trackingSubscription !== null;
  }
}