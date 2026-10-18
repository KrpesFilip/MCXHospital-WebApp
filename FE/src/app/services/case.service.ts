import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { Case, CreateCaseDTO, CreateSosCaseDTO, UpdateCaseDTO } from '../models/case.model';


@Injectable({
  providedIn: 'root'
})
export class CaseService {

  private apiUrl = '';
  private casesSubject = new BehaviorSubject<Case[]>([]);
  public cases$ = this.casesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.configService.getConfig().subscribe(config => {
      this.apiUrl = `${config.Urls.apiUrl}/cases`;
      this.loadCases();
    });
  }

  private loadCases(): void {
    this.http.get<Case[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (cases) => {
        this.casesSubject.next(cases);
      },
      error: (error) => {
        console.error('Error loading cases:', error);
      }
    });
  }

  private createHeaders(): HttpHeaders {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getAllCases(): Observable<Case[]> {
    return this.http.get<Case[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getCaseById(id: number): Observable<Case> {
    return this.http.get<Case>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getActiveCaseByUser(userId: number): Observable<Case[]> {
    return this.configService.getConfig().pipe(
      switchMap(config => {
        return this.http.get<Case[]>(`${config.Urls.apiUrl}/cases/active/${userId}`).pipe(
          catchError(this.handleError)
        );
      })
    );
  }

  deleteCase(id: number): Observable<void> {
    return new Observable(observer => {
      this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.handleError)
      ).subscribe({
        next: () => {
          this.loadCases(); // Refresh cases after deletion
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  createRegularCase(caseData: CreateCaseDTO, token?: string): Observable<Case> {
    return this.configService.getConfig().pipe(
      switchMap(config => {
        const url = `${config.Urls.apiUrl}/cases/regular`;
        const headers = this.createHeaders();
        return this.http.post<Case>(url, caseData, { headers }).pipe(
          catchError(this.handleError)
        );
      })
    );
  }

  updateRegularCase(caseId: number, caseData: UpdateCaseDTO, token?: string): Observable<Case> {
    return this.configService.getConfig().pipe(
      switchMap(config => {
        const url = `${config.Urls.apiUrl}/cases/${caseId}`;
        const headers = this.createHeaders();
        return this.http.put<Case>(url, caseData, { headers }).pipe(
          catchError(this.handleError)
        );
      })
    );
  }

  createSosCase(sosCase: CreateSosCaseDTO, token?: string): Observable<Case> {
    return this.configService.getConfig().pipe(
      switchMap(config => {
        const url = `${config.Urls.apiUrl}/cases/sos`;
        const headers = this.createHeaders();
        return this.http.post<Case>(url, sosCase, { headers });
      })
    );
  }

  updateSosCase(caseId: number, sosCase: UpdateCaseDTO, token?: string): Observable<Case> {
    return this.configService.getConfig().pipe(
      switchMap(config => {
        const url = `${config.Urls.apiUrl}/cases/${caseId}`;
        const headers = this.createHeaders();
        return this.http.put<Case>(url, sosCase, { headers });
      })
    );
  }

  endCase(caseId: number, token?: string): Observable<Case> {
    return this.configService.getConfig().pipe(
      switchMap(config => {
        const url = `${config.Urls.apiUrl}/cases/${caseId}/end`;
        const headers = this.createHeaders();
        const body = { isActive: false };
        return this.http.put<Case>(url, body, { headers });
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server error: ${error.status} - ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}