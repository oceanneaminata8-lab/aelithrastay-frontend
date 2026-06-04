import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { Amenity, Page, Property } from './models';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  constructor(private http: HttpClient) {}

  list(filters: Record<string, string> = {}): Observable<Page<Property>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });
    return this.http.get<Page<Property>>(`${API_BASE_URL}/properties/`, { params });
  }

  mine(): Observable<Page<Property>> {
    return this.list({ mine: 'true' });
  }

  detail(id: number): Observable<Property> {
    return this.http.get<Property>(`${API_BASE_URL}/properties/${id}/`);
  }

  create(payload: Partial<Omit<Property, 'price_per_night' | 'cleaning_fee' | 'bathrooms'>> & {
    price_per_night?: string | number;
    cleaning_fee?: string | number;
    bathrooms?: string | number;
    amenity_ids?: number[];
  }): Observable<Property> {
    return this.http.post<Property>(`${API_BASE_URL}/properties/`, payload);
  }

  amenities(): Observable<Page<Amenity>> {
    return this.http.get<Page<Amenity>>(`${API_BASE_URL}/amenities/`);
  }

  update(id: number, payload: Partial<Property>): Observable<Property> {
    return this.http.patch<Property>(`${API_BASE_URL}/properties/${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/properties/${id}/`);
  }
}
