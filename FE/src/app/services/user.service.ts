import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';


export type UserRole = 'VEHICLE' | 'HOSPITAL' | 'ADMIN';

export interface User {
    id: number;
    role: UserRole;
    username: string;
    isEnabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {

    private usersSubject = new BehaviorSubject<User[]>([]);

    private apiUrl = '';

    private readonly ngrokHeaders = new HttpHeaders({
        'ngrok-skip-browser-warning': 'true'
    });

    constructor(
        private http: HttpClient,
        private configService: ConfigService
    ) {
        this.configService.getConfig().subscribe(config => {
            this.apiUrl = `${config.Urls.apiUrl}/admin/users`;


          this.loadUsers();
        });
    }

    private authHeaders(): HttpHeaders {
      const token = localStorage.getItem('auth_token');

      return new HttpHeaders({
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        Authorization: `Bearer ${token}`
      });
    }

    private sortUsersByCreatedAtDesc(users: User[]): User[] {
        return [...users].sort((a, b) => this.getCreatedAtTime(b) - this.getCreatedAtTime(a));
    }

    private getCreatedAtTime(user: User): number {
        return user.createdAt ? new Date(user.createdAt).getTime() : 0;
    }



    private loadUsers(): void {


        this.http.get<any[]>(this.apiUrl, { headers: this.authHeaders() }).subscribe({
            next: users => {
                const mappedUsers: User[] = users.map(u => ({
                    id: typeof u.id === 'string' ? parseInt(u.id, 10) : u.id,
                    role: u.role,
                    username: u.username,
                    isEnabled: u.isEnabled,
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt
                }));
                this.usersSubject.next(this.sortUsersByCreatedAtDesc(mappedUsers));
                console.log('Loaded users:', mappedUsers);
            },
            error: error => {
                console.error('Error fetching users:', error);
            }
        });
    }

    get users$(): Observable<User[]> {
        return this.usersSubject.asObservable();
    }

    getAll(): User[] {
        console.log('Getting all users:', this.usersSubject.value);
        return this.usersSubject.value;
    }

    create(userData: { username: string; password: string; role: UserRole }): void {
        this.http.post<User>(this.apiUrl, userData, { headers: this.authHeaders() }).subscribe({
            next: newUser => {
                const users = this.sortUsersByCreatedAtDesc([newUser, ...this.usersSubject.value]);
                this.usersSubject.next(users);
            },
            error: error => {
                console.error('Error creating user (backend not available):', error);
                // Add locally for offline development
                const mockUser: User = {
                    id: Date.now(),
                    username: userData.username,
                    role: userData.role,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                const users = this.sortUsersByCreatedAtDesc([mockUser, ...this.usersSubject.value]);
                this.usersSubject.next(users);
            }
        });
    }

    update(user: User, password?: string): void {
        const updateData: any = { username: user.username, role: user.role };


        this.http.put<User>(`${this.apiUrl}/${user.id}`, updateData, { headers: this.authHeaders() }).subscribe({
            next: updatedUser => {
                const users = this.usersSubject.value.map(u =>
                    u.id === user.id ? updatedUser : u
                );
                this.usersSubject.next(this.sortUsersByCreatedAtDesc(users));

                if (password) {
                    const passwordData = { newPassword: password };
                    this.http.put(`${this.apiUrl}/${user.id}/password`, passwordData, { headers: this.authHeaders() }).subscribe({
                        next: () => {
                            console.log('Password updated successfully for user', user.id);
                        },
                        error: error => {
                            console.error('Error updating password:', error);
                        }
                    });
                }
            },
            error: error => {
                console.error('Error updating user (backend not available):', error);
                // Update locally for offline development
                const users = this.usersSubject.value.map(u =>
                    u.id === user.id ? user : u
                );
                this.usersSubject.next(this.sortUsersByCreatedAtDesc(users));
            }
        });
    }

    updateStatus(userId: number, isEnabled: boolean): Observable<User> {
        const updateData: any = { isEnabled };
        return this.http.put<User>(`${this.apiUrl}/${userId}/status`, updateData, { headers: this.authHeaders() }).pipe(
            catchError(error => {
                console.error('Error updating user status:', error);
                return throwError(() => error);
            })
        );
    }

    updateLocalUserStatus(userId: number, isEnabled: boolean | undefined): void {
        const users = this.usersSubject.value.map(u =>
            u.id === userId ? { ...u, isEnabled } : u
        );
        this.usersSubject.next(this.sortUsersByCreatedAtDesc(users));
    }

    /* delete(id: number): void {
         this.http.delete(`${this.apiUrl}/${id}`, { headers: this.authHeaders() }).subscribe({
             next: () => {
                 const users = this.usersSubject.value.filter(u => u.id !== id);
                 this.usersSubject.next(users);
             },
             error: error => {
                 console.error('Error deleting user (backend not available):', error);
                 // Delete locally for offline development
                 const users = this.usersSubject.value.filter(u => u.id !== id);
                 this.usersSubject.next(users);
             }
         });
     }
    */
}

