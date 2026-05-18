// src/app/core/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  token: string;
  profileId?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  currentUser = signal<AuthUser | null>(this.loadFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(user => {
        localStorage.setItem('clinic_user', JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  registerPatient(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/patient`, data);
  }

  logout(): void {
    localStorage.removeItem('clinic_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

  private loadFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem('clinic_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
