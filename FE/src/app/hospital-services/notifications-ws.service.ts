import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from './config-service';
import { Notification } from '../hospital-models/notification-model';

@Injectable({ providedIn: 'root' })
export class NotificationsWebSocketService {
  private configService = inject(ConfigService);

  private ws?: WebSocket;
  private reconnectInterval?: any;

  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  private notifications = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notifications.asObservable();

  connect(hospitalId: number) {
    this.disconnect();

    const wsUrl = `${this.configService.getNotificationsUrl}/${hospitalId}`;
    console.log('Notifications WebSocket URL:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.connectedSubject.next(true);

        if (this.reconnectInterval) {
          clearTimeout(this.reconnectInterval);
          this.reconnectInterval = undefined;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          let newNotification: Notification = {
            caseId: data.caseId,
            senderName: data.senderName,
            message: data.message,
            createdAt: new Date().toISOString()
            };
          const currentNotifications = this.notifications.getValue();
          this.notifications.next([newNotification, ...currentNotifications]);

          setTimeout(() => {
            const updatedNotifications = this.notifications.getValue().filter(n => n !== newNotification);
            this.notifications.next(updatedNotifications);
            console.log('Notifications ', this.notifications.getValue());
          }, 5000);
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Notifications WebSocket error:', error);
      };

      this.ws.onclose = () => {
        this.connectedSubject.next(false);
        
      };
    } catch (error) {
      console.error('Failed to create notifications WebSocket:', error);
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

  addLocalNotification(notification: Notification) {
    const currentNotifications = this.notifications.getValue();
    this.notifications.next([notification, ...currentNotifications]);

    setTimeout(() => {
      const updatedNotifications = this.notifications.getValue().filter(n => n !== notification);
      this.notifications.next(updatedNotifications);
    }, 5000);
  }


}