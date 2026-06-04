import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_suspended: boolean;
  is_staff: boolean;
  date_joined: string;
}

export interface Dispute {
  id: number;
  guest_id: number;
  guest_name: string;
  property_id: number;
  property_title: string;
  dispute_status: 'none' | 'open' | 'reviewing' | 'resolved';
  dispute_reason: string;
  dispute_resolution: string;
  created_at: string;
}

export interface ReviewModeration {
  id: number;
  guest_id: number;
  guest_name: string;
  property_id: number;
  property_title: string;
  rating: number;
  comment: string;
  moderation_status: 'clean' | 'reported' | 'hidden' | 'resolved';
  moderation_note: string;
  created_at: string;
}

export interface PropertyModeration {
  id: number;
  title: string;
  host_id: number;
  host_name: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_reported: boolean;
  moderation_note: string;
  created_at: string;
}

export interface AdminLog {
  id: number;
  admin_username: string;
  action_type: string;
  object_type: string;
  object_id: number;
  details: Record<string, any>;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  // USER MANAGEMENT
  getAdminUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${API_BASE_URL}/admin/users/`);
  }

  suspendUser(userId: number): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${API_BASE_URL}/admin/users/${userId}/suspend/`, {});
  }

  activateUser(userId: number): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${API_BASE_URL}/admin/users/${userId}/activate/`, {});
  }

  changeUserRole(userId: number, role: 'guest' | 'host' | 'admin'): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${API_BASE_URL}/admin/users/${userId}/change_role/`, { role });
  }

  // DISPUTE MANAGEMENT
  getDisputes(status?: string): Observable<Dispute[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('dispute_status', status);
    }
    return this.http.get<Dispute[]>(`${API_BASE_URL}/admin/disputes/`, { params });
  }

  markDisputeReviewing(disputeId: number): Observable<Dispute> {
    return this.http.post<Dispute>(`${API_BASE_URL}/admin/disputes/${disputeId}/mark_reviewing/`, {});
  }

  resolveDispute(disputeId: number, resolution: string): Observable<Dispute> {
    return this.http.post<Dispute>(`${API_BASE_URL}/admin/disputes/${disputeId}/resolve/`, { resolution });
  }

  getDisputeStats(): Observable<any> {
    return this.http.get<any>(`${API_BASE_URL}/admin/disputes/statistics/`);
  }

  // REVIEW MODERATION
  getReviewsForModeration(status?: string): Observable<ReviewModeration[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ReviewModeration[]>(`${API_BASE_URL}/admin/reviews/`, { params });
  }

  hideReview(reviewId: number, note: string): Observable<ReviewModeration> {
    return this.http.post<ReviewModeration>(`${API_BASE_URL}/admin/reviews/${reviewId}/hide/`, { note });
  }

  markReviewReported(reviewId: number): Observable<ReviewModeration> {
    return this.http.post<ReviewModeration>(`${API_BASE_URL}/admin/reviews/${reviewId}/mark_reported/`, {});
  }

  resolveReviewReport(reviewId: number, resolution: string): Observable<ReviewModeration> {
    return this.http.post<ReviewModeration>(`${API_BASE_URL}/admin/reviews/${reviewId}/resolve/`, { resolution });
  }

  getReviewStats(): Observable<any> {
    return this.http.get<any>(`${API_BASE_URL}/admin/reviews/statistics/`);
  }

  // PROPERTY MODERATION
  getPropertiesForApproval(status?: string): Observable<PropertyModeration[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('approval_status', status);
    }
    return this.http.get<PropertyModeration[]>(`${API_BASE_URL}/admin/properties/`, { params });
  }

  approveProperty(propertyId: number, note?: string): Observable<PropertyModeration> {
    return this.http.post<PropertyModeration>(`${API_BASE_URL}/admin/properties/${propertyId}/approve/`, { note });
  }

  rejectProperty(propertyId: number, reason: string): Observable<PropertyModeration> {
    return this.http.post<PropertyModeration>(`${API_BASE_URL}/admin/properties/${propertyId}/reject/`, { reason });
  }

  markPropertyReported(propertyId: number, reportReason: string): Observable<PropertyModeration> {
    return this.http.post<PropertyModeration>(`${API_BASE_URL}/admin/properties/${propertyId}/mark_reported/`, { report_reason: reportReason });
  }

  resolvePropertyReport(propertyId: number, resolution: string): Observable<PropertyModeration> {
    return this.http.post<PropertyModeration>(`${API_BASE_URL}/admin/properties/${propertyId}/resolve_report/`, { resolution });
  }

  getPropertyStats(): Observable<any> {
    return this.http.get<any>(`${API_BASE_URL}/admin/properties/statistics/`);
  }

  // PAYMENT & REVENUE
  getPaymentStats(): Observable<any> {
    return this.http.get<any>(`${API_BASE_URL}/admin/payments/statistics/`);
  }

  processRefund(paymentId: number, reason: string): Observable<any> {
    return this.http.post<any>(`${API_BASE_URL}/admin/payments/${paymentId}/refund/`, { reason });
  }

  // NOTIFICATIONS
  sendNotificationToAll(title: string, message: string): Observable<any> {
    return this.http.post(`${API_BASE_URL}/admin/notifications/broadcast/`, { title, message });
  }

  sendNotificationToRole(title: string, message: string, role: 'guest' | 'host' | 'admin'): Observable<any> {
    return this.http.post(`${API_BASE_URL}/admin/notifications/send_to_role/`, { title, message, role });
  }

  sendNotificationToUser(userId: number, title: string, message: string): Observable<any> {
    return this.http.post(`${API_BASE_URL}/admin/notifications/send_to_user/`, { user_id: userId, title, message });
  }

  getAdminNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/admin/notifications/admin_notifications/`);
  }

  // ADMIN LOGS
  getAdminLogs(actionType?: string, objectType?: string): Observable<AdminLog[]> {
    let params = new HttpParams();
    if (actionType) {
      params = params.set('action_type', actionType);
    }
    if (objectType) {
      params = params.set('object_type', objectType);
    }
    return this.http.get<AdminLog[]>(`${API_BASE_URL}/admin/logs/`, { params });
  }
}

