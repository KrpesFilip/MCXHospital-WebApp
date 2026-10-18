import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private  baseUrl = '';
  private lastError = '';

  constructor(
  private http: HttpClient,
  private router: Router,
  private configService: ConfigService
) {
  this.configService.getConfig().subscribe(config => {
    this.baseUrl = config.Urls.apiUrl;
  });
}


  private decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (err) {
      return null;
    }
  }

  private getRedirectPath(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'vehicle':
        return '/ems';
      case 'hospital':
        return '/hospital';
      default:
        return '/error';
    }
  }

private authHeaders(): HttpHeaders {
  const token = localStorage.getItem('auth_token');
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    Authorization: token ? `Bearer ${token}` : ''
  });
}


  async isUserDisabled(name: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/admin/users`;
      //const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' });
      const users: any[] = await firstValueFrom(this.http.get<any[]>(url, { headers: this.authHeaders() }));
      const match = users.find(u => (u.username || u.name || '').toLowerCase() === name.toLowerCase());
      return match ? match.isEnabled === false : false;
    } catch {
      // If the pre-check fails, don't block login
      return false;
    }
  }

  async login(name: string, password: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/user/login`;
      const body = { name, password };
      const resp: any = await firstValueFrom(
        this.http.post(url, body, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) })
      );
      const token = resp?.token || resp?.accessToken || null;
      if (token) {
        this.lastError = '';
        localStorage.setItem('auth_token', token);
        localStorage.setItem('loggedIn', 'true');


        const decoded = this.decodeJWT(token);
        const role = decoded?.group || decoded?.groups?.[0] || 'hospital';
        const name = decoded?.name || "Unknown";
        localStorage.setItem('userName', name);
        localStorage.setItem('userId', decoded?.sub || '');


        const redirectPath = this.getRedirectPath(role);
        this.router.navigate([redirectPath]);
        return true;
      }
      return false;
    } catch (err: any) {
      // Pohvati specifičnu error poruku sa backend-a
      if (err?.error?.error) {
        this.lastError = err.error.error;
      } else {
        this.lastError = '';
      }
      return false;
    }
  }

  getLastError(): string {
    return this.lastError;
  }

   getUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : 0;
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const url = `${this.baseUrl}/user/logout`;
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      try {
        await firstValueFrom(this.http.post(url, {}, { headers }));
      } catch (err) {
      }
    }
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('auth_token') != null || localStorage.getItem('loggedIn') === 'true';
  }

  getUserRole(): string | null {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return null;
    }
    const decoded = this.decodeJWT(token);
    return decoded?.group || decoded?.groups?.[0] || null;
  }

  getUserName(): string | null {
    return localStorage.getItem('userName') || "Unknown";
  }
}
