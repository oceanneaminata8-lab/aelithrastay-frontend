import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { Booking, Page } from './models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) {}

  list(): Observable<Page<Booking>> {
    return this.http.get<Page<Booking>>(`${API_BASE_URL}/bookings/`);
  }

  detail(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${API_BASE_URL}/bookings/${id}/`);
  }

  create(payload: { property: number; check_in: string; check_out: string; guests: number }): Observable<Booking> {
    return this.http.post<Booking>(`${API_BASE_URL}/bookings/`, payload);
  }

  update(id: number, payload: Partial<Booking>): Observable<Booking> {
    return this.http.patch<Booking>(`${API_BASE_URL}/bookings/${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/bookings/${id}/`);
  }
}
