import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { Page, User } from './models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  list(filters: any = {}): Observable<Page<User>> {
    return this.http.get<Page<User>>(`${API_BASE_URL}/users/`, { params: filters });
  }

  update(id: number, payload: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${API_BASE_URL}/users/${id}/`, payload);
  }

  updateForm(id: number, payload: FormData): Observable<User> {
    return this.http.patch<User>(`${API_BASE_URL}/users/${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/users/${id}/`);
  }
}
