import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { Page, Review } from './models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private http: HttpClient) {}

  list(propertyId: number): Observable<Page<Review>> {
    const params = new HttpParams().set('property', propertyId);
    return this.http.get<Page<Review>>(`${API_BASE_URL}/reviews/`, { params });
  }

  create(payload: { property: number; rating: number; comment: string }): Observable<Review> {
    return this.http.post<Review>(`${API_BASE_URL}/reviews/`, payload);
  }
}
