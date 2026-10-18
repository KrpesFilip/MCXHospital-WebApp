import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

export interface AppConfig {
  Urls: {
    apiUrl: string;
    wsUrl: string;
    sendMsgUrl: string;
    getMsgUrl: string;
  };
  MapSettings: {
    HOSPITAL_LAT: number;
    HOSPITAL_LNG: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config$: Observable<AppConfig> | null = null;
  apiUrl: string = '';

  constructor(private http: HttpClient) {
    this.loadConfig().subscribe(config => {
      this.apiUrl = config.Urls.apiUrl;
    });
  }

  loadConfig(): Observable<AppConfig> {
    if (!this.config$) {
      this.config$ = this.http.get<AppConfig>('/assets/config.json').pipe(
        shareReplay(1),
        catchError((error) => {
          console.error('Error loading config:', error);
          return of({ 
            Urls: { apiUrl: 'http://localhost:8080', wsUrl: 'ws://localhost:8080/ws/cases', sendMsgUrl: 'ws://localhost:8080/chat', getMsgUrl: 'http://localhost:8080/messages/case' },
            MapSettings: { HOSPITAL_LAT: 45.558125, HOSPITAL_LNG: 18.713756 }
          });
        })
      );
    }
    return this.config$;
  }

  getConfig(): Observable<AppConfig> {
    return this.loadConfig();
  }
}
