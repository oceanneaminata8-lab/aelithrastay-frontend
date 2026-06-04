import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { Page, WishlistItem } from './models';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  constructor(private http: HttpClient) {}

  list(): Observable<Page<WishlistItem>> {
    return this.http.get<Page<WishlistItem>>(`${API_BASE_URL}/wishlist/`);
  }

  add(property: number): Observable<WishlistItem> {
    return this.http.post<WishlistItem>(`${API_BASE_URL}/wishlist/`, { property });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/wishlist/${id}/`);
  }
}
