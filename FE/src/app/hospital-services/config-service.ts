import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
    Urls: {
        apiUrl: string;
        wsUrl: string;
        sendMsgUrl: string;
        getMsgUrl: string;
        hospitalNotificationsUrl: string;
    };
    MapSettings: {
        HOSPITAL_LAT: number;
        HOSPITAL_LNG: number;
    };
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
    private config: AppConfig | null = null;
    private http = inject(HttpClient);

    async loadConfig(): Promise<void> {
        try {
            this.config = await firstValueFrom(this.http.get<AppConfig>('assets/config.json'));
            console.log('✅ Configuration loaded:', this.config);
        } catch (error) {
            console.error('❌ Failed to load configuration:', error);
            // Fallback or rethrow depending on requirements
        }
    }

    get apiUrl(): string {
        return this.config?.Urls.apiUrl || '';
    }

    get wsUrl(): string {
        return this.config?.Urls.wsUrl || '';
    }

    get sendMsgUrl(): string {
        return this.config?.Urls.sendMsgUrl || '';
    }

    get getMsgUrl(): string {
        return this.config?.Urls.getMsgUrl || '';
    }

    get getNotificationsUrl(): string {
        return this.config?.Urls.hospitalNotificationsUrl || '';
    }

    get hospitalLat(): number {
        return this.config?.MapSettings.HOSPITAL_LAT || 0;
    }

    get hospitalLng(): number {
        return this.config?.MapSettings.HOSPITAL_LNG || 0;
    }
}
