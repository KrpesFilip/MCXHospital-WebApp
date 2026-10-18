import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class HospitalAuthService {
  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  getRole(): string {
    // decode JWT
    const payload = JSON.parse(atob(this.getToken().split('.')[1]));
    return payload.role;
  }

  getUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : 0;
  }

  getUserName(): string {
    const userName = localStorage.getItem('userName');
    return userName || 'Unknown';
  }
}