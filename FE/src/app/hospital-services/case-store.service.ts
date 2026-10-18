import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CaseModel } from '../hospital-models/case-model';
import { HospitalAuthService } from '../hospital-services/auth-service';
import { CaseWebSocketService } from './case-websocket.service';
import { ConfigService } from './config-service';

@Injectable({ providedIn: 'root' })
export class CaseService {
  private http = inject(HttpClient);
  private authService = inject(HospitalAuthService);
  private wsService = inject(CaseWebSocketService);
  private configService = inject(ConfigService);

  private get API_URL(): string {
    return this.configService.apiUrl + '/cases';
  }

  cases = signal<CaseModel[]>([]);
  selectedCase = signal<CaseModel | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  private caseEndedSubject = new Subject<CaseModel>();
  public caseEnded$ = this.caseEndedSubject.asObservable();


  constructor() {
    this.initWebSocket();
  }


  private initWebSocket() {
    this.wsService.connect();

    this.wsService.message$.subscribe((message) => {
      if (!message) return;

      console.log('🔔 Case update received:', message);

      switch (message.type) {
        case 'CREATE':
          if (message.data) {
            this.handleCaseCreate(message.data);
          }
          break;

        case 'UPDATE':
        case 'ACKNOWLEDGE':
          if (message.data) {
            this.handleCaseUpdate(message.data);
          }
          break;

        case 'DELETE':
          if (message.data?.id) {
            this.handleCaseDelete(message.data.id);
          }
          break;

        case 'END':
          if (message.data) {
            this.handleCaseEnd(message.data);
          }
          break;

        case 'LOCATION_UPDATE':
          if (message.caseId && message.latitude && message.longitude) {
            this.handleLocationUpdate(message.caseId, message.latitude, message.longitude, message.etaMinutes);
          }
          break;
      }
    });
  }

  
  private handleCaseCreate(caseData: CaseModel) {
    const processedCase = this.processCase(caseData);

    // Check if case already exists
    if (!this.cases().find(c => c.id === caseData.id)) {
      this.cases.update(cases => [...cases, processedCase]);
      console.log('✅ New case added:', processedCase.id);
    }
  }

 
  private handleCaseUpdate(caseData: CaseModel) {
    const idx = this.cases().findIndex(c => c.id === caseData.id);

    if (idx >= 0) {
      this.cases.update(cases => {
        const updated = [...cases];
        updated[idx] = this.processCase(caseData);
        return updated;
      });
      console.log('✅ Case updated:', caseData.id);

      // Update selected case if it matches
      if (this.selectedCase()?.id === caseData.id) {
        this.selectedCase.set(this.processCase(caseData));
      }
    }
  }


  private handleCaseDelete(caseId: number) {
    const filtered = this.cases().filter(c => c.id !== caseId);

    if (filtered.length !== this.cases().length) {
      this.cases.set(filtered);
      console.log('✅ Case deleted:', caseId);

      // Clear selected case if deleted
      if (this.selectedCase()?.id === caseId) {
        this.selectedCase.set(null);
      }
    }
  }

  private handleCaseEnd(caseData: CaseModel) {
    const processedCase = this.processCase(caseData);
    
    // Update the case to show it's ended (isActive: false)
    const idx = this.cases().findIndex(c => c.id === caseData.id);
    if (idx >= 0) {
      this.cases.update(cases => {
        const updated = [...cases];
        updated[idx] = processedCase;
        return updated;
      });
    }

    // Update selected case if it matches
    if (this.selectedCase()?.id === caseData.id) {
      this.selectedCase.set(processedCase);
    }

    console.log('🏁 Case ended:', caseData.id);

    // Emit event for components to show notification
    this.caseEndedSubject.next(processedCase);

    // Remove from active cases after 5 seconds
    setTimeout(() => {
      this.cases.update(cases => cases.filter(c => c.id !== caseData.id));
      console.log('🗑️ Case removed from active list:', caseData.id);

      // Deselect if this was the selected case
      if (this.selectedCase()?.id === caseData.id) {
        this.selectedCase.set(null);
      }
    }, 5000);
  }

  /**
   * Handle location update for case
   */
  private handleLocationUpdate(caseId: number, latitude: number, longitude: number, etaMinutes?: number) {
    const idx = this.cases().findIndex(c => c.id === caseId);

    if (idx >= 0) {
      this.cases.update(cases => {
        const updated = [...cases];
        updated[idx] = {
          ...updated[idx],
          latitude,
          longitude,
          ...(etaMinutes != undefined && { etaMinutes }), // Only update if etaMinutes
        };
        return updated;
      });
      console.log('✅ Location updated for case:', caseId, latitude, longitude);

      // Update selected case if it matches
      if (this.selectedCase()?.id === caseId) {
        this.selectedCase.update(current => current ? {
          ...current,
          latitude,
          longitude,
          ...(etaMinutes != undefined && { etaMinutes }), 
        } : null);
      }
    }
  }


  getAllCases(): Observable<CaseModel[]> {
    this.loading.set(true);
    this.error.set(null);

    console.log('🔄 Dohvaćam cases sa:', this.API_URL);

    return this.http.get<CaseModel[]>(this.API_URL).pipe(
      tap((cases) => {
        console.log('✅ Backend odgovorio sa:', cases);

        const processedCases = Array.isArray(cases)
          ? cases.map(c => this.processCase(c))
          : [];

        console.log('📋 Procesiran broj slučajeva:', processedCases.length);

        this.cases.set(processedCases);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('❌ Greška pri učitavanju slučajeva:', error);
        this.error.set('Greška pri učitavanju slučajeva');
        this.loading.set(false);
        return of([]);
      })
    );
  }


  getCase(id: number): Observable<CaseModel> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<CaseModel>(`${this.API_URL}/${id}`).pipe(
      tap((caseData) => {
        const processedCase = this.processCase(caseData);
        this.selectedCase.set(processedCase);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error(`❌ Greška pri učitavanju slučaja #${id}:`, error);
        this.error.set(`Greška pri učitavanju slučaja #${id}`);
        this.loading.set(false);
        return of(null as any);
      })
    );
  }


  acknowledgeCase(id: number): Observable<CaseModel> {
    this.loading.set(true);
    this.error.set(null);

    const body = { acknowledged: true };

    return this.http.put<CaseModel>(`${this.API_URL}/${id}/acknowledge`, body, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap((updatedCase) => {
        // Update in list
        const idx = this.cases().findIndex((c) => c.id === id);
        if (idx >= 0) {
          this.cases.update(cases => {
            const updated = [...cases];
            updated[idx] = this.processCase(updatedCase);
            return updated;
          });
        }

        // Update selected case if it matches
        if (this.selectedCase()?.id === id) {
          this.selectedCase.set(this.processCase(updatedCase));
        }

        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set(`Greška pri potvrdi slučaja #${id}`);
        this.loading.set(false);
        console.error('Greška pri potvrdi slučaja', error);
        throw error;
      })
    );
  }

  refreshCases(): Observable<CaseModel[]> {
    return this.getAllCases();
  }


  private processCase(caseData: CaseModel): CaseModel {
    const age = new Date().getFullYear() - caseData.birthYear;

    let status: 'DRAFT' | 'SENT' | 'ACKNOWLEDGED' | 'CLOSED' = 'SENT';
    if (caseData.acknowledged) {
      status = 'ACKNOWLEDGED';
    }
    if (!caseData.isActive) {
      status = 'CLOSED';
    }

    let summary = caseData.description;
    if (caseData.bpm) {
      summary += ` • ❤️ ${caseData.bpm} bpm`;
    }
    if (caseData.temperature) {
      summary += ` • 🌡️ ${caseData.temperature}°C`;
    }

    return {
      ...caseData,
      status,
      summary,
    };
  }

  
  // Prepare HTTP headers with JWT token
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  
  selectCase(caseData: CaseModel | null) {
    this.selectedCase.set(caseData);
  }

  getCasesSync(): CaseModel[] {
    return this.cases();
  }

  getSelectedCaseSync(): CaseModel | null {
    return this.selectedCase();
  }
}