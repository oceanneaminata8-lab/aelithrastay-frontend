import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api';
import { User } from './models';

interface TokenResponse {
  access: string;
  refresh: string;
}

interface RefreshResponse {
  access: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(this.loadStoredUser());

  constructor(private http: HttpClient) {}

  register(payload: Partial<User> & { password: string }): Observable<User> {
    // Fixed: Removed duplicate /api prefix
    return this.http.post<User>(`${API_BASE_URL}/auth/register/`, payload);
  }

  login(username: string, password: string): Observable<TokenResponse> {
    // Fixed: Removed duplicate /api prefix
    return this.http.post<TokenResponse>(`${API_BASE_URL}/auth/login/`, { username, password }).pipe(
      tap((tokens) => {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
      })
    );
  }

  refreshAccessToken(): Observable<RefreshResponse> {
    const refresh = localStorage.getItem('refresh_token');
    // Fixed: Removed duplicate /api prefix
    return this.http.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh/`, { refresh }).pipe(
      tap((tokens) => localStorage.setItem('access_token', tokens.access))
    );
  }

  loadMe(): Observable<User> {
    // Fixed: Removed duplicate /api prefix
    return this.http.get<User>(`${API_BASE_URL}/auth/me/`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        localStorage.setItem('current_user', JSON.stringify(user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
  }

  setCurrentUser(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  isLoggedIn(): boolean {
    return Boolean(localStorage.getItem('access_token'));
  }

  private loadStoredUser(): User | null {
    const stored = localStorage.getItem('current_user');
    return stored ? JSON.parse(stored) : null;
  }
}