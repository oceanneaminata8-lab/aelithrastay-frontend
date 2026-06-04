import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Booking, Property, User } from '../../core/models';
import { BookingService } from '../../core/booking.service';
import { PropertyService } from '../../core/property.service';
import { UserService } from '../../core/user.service';
import { AdminService, Dispute, ReviewModeration, PropertyModeration, AdminUser } from '../../core/admin.service';
import { LanguageService } from '../../core/language.service';

type AdminPanel = 'dashboard' | 'properties' | 'reservations' | 'users' | 'analytics' | 'locations' | 'disputes' | 'reviews' | 'property-approval' | 'notifications';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, DecimalPipe, RouterLink],
  template: `
    <section class="admin-layout">
      <aside class="admin-sidebar">
        <div>
          <h1>{{ language.t('adminPortalTitle') }}</h1>
          <p>{{ language.t('managementPortal') }}</p>
        </div>
        <nav>
          <button type="button" [class.active]="activePanel() === 'dashboard'" (click)="switchPanel('dashboard')"><span class="material-symbols-outlined">dashboard</span>{{ language.t('admin') }}</button>
          <button type="button" [class.active]="activePanel() === 'properties'" (click)="switchPanel('properties')"><span class="material-symbols-outlined">home_work</span>{{ language.t('propertyListings') }}</button>
          <button type="button" [class.active]="activePanel() === 'property-approval'" (click)="switchPanel('property-approval')"><span class="material-symbols-outlined">fact_check</span>{{ language.t('propertyApproval') }}</button>
          <button type="button" [class.active]="activePanel() === 'reservations'" (click)="switchPanel('reservations')"><span class="material-symbols-outlined">calendar_month</span>{{ language.t('reservations') }}</button>
          <button type="button" [class.active]="activePanel() === 'disputes'" (click)="switchPanel('disputes')"><span class="material-symbols-outlined">gavel</span>{{ language.t('disputesTitle') }}</button>
          <button type="button" [class.active]="activePanel() === 'reviews'" (click)="switchPanel('reviews')"><span class="material-symbols-outlined">rate_review</span>{{ language.t('reviewModeration') }}</button>
          <button type="button" [class.active]="activePanel() === 'users'" (click)="switchPanel('users')"><span class="material-symbols-outlined">group</span>{{ language.t('userManagement') }}</button>
          <button type="button" [class.active]="activePanel() === 'notifications'" (click)="switchPanel('notifications')"><span class="material-symbols-outlined">notifications</span>{{ language.t('notificationsTitle') }}</button>
          <button type="button" [class.active]="activePanel() === 'analytics'" (click)="switchPanel('analytics')"><span class="material-symbols-outlined">analytics</span>{{ language.t('analyticsTitle') }}</button>
        </nav>
        <a class="admin-add" routerLink="/host">{{ language.t('addNewListing') }}</a>
      </aside>

      <main class="admin-main">
        <header class="admin-head">
          <div>
            <h2>{{ pageTitle() }}</h2>
            <p>{{ pageSubtitle() }}</p>
          </div>
          <div class="actions">
            <label class="admin-search">
              <span class="material-symbols-outlined">search</span>
              <input [placeholder]="language.t('searchRecords')" (input)="search.set(inputValue($event))" />
            </label>
            <button type="button" (click)="exportReport()">
              <span class="material-symbols-outlined">download</span> {{ language.t('export') }}
            </button>
            <a routerLink="/host">
              <span class="material-symbols-outlined">add</span> {{ language.t('listing') }}
            </a>
          </div>
        </header>

        @if (notice()) {
          <p class="toast">{{ notice() }}</p>
        }

        <section class="admin-stats">
          <button type="button" (click)="switchPanel('users')">
            <span class="material-symbols-outlined">group</span>
            <p>{{ language.t('totalUsers') }}</p>
            <strong>{{ users().length }}</strong>
            <em>+{{ (users().length * 0.1) | number:'1.0-0' }}</em>
          </button>
          <button type="button" (click)="switchPanel('properties')">
            <span class="material-symbols-outlined">apartment</span>
            <p>{{ language.t('activeListings') }}</p>
            <strong>{{ properties().length }}</strong>
            <em>{{ language.t('new') }}</em>
          </button>
          <button type="button" (click)="switchPanel('reservations')">
            <span class="material-symbols-outlined">book_online</span>
            <p>{{ language.t('reservations') }}</p>
            <strong>{{ bookings().length }}</strong>
            <em>Live</em>
          </button>
          <button type="button" (click)="switchPanel('analytics')">
            <span class="material-symbols-outlined">payments</span>
            <p>{{ language.t('revenueTitle') }}</p>
            <strong>{{ revenue() | currency:'XAF':'symbol':'1.0-0' }}</strong>
            <em>+18%</em>
          </button>
        </section>

        @if (activePanel() === 'dashboard' || activePanel() === 'reservations') {
          <section class="admin-grid" id="reservations">
            <article class="admin-table-card">
              <div class="admin-card-head">
                <h3>Recent Reservations</h3>
                @if (activePanel() === 'dashboard') {
                  <button type="button" (click)="switchPanel('reservations')">View All</button>
                }
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Dates</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (booking of filteredBookings(); track booking.id) {
                    <tr>
                      <td class="clickable" (click)="openBooking(booking.id)">{{ booking.property_title }}</td>
                      <td>{{ booking.check_in | date:'MMM d' }} - {{ booking.check_out | date:'MMM d' }}</td>
                      <td>{{ booking.total_price | currency:'XAF' }}</td>
                      <td><span class="status-pill {{ booking.status }}">{{ booking.status }}</span></td>
                      <td>
                        <div class="table-actions">
                          @if (booking.status !== 'cancelled') {
                            <button class="btn-icon delete" (click)="cancelBooking(booking.id)" title="Cancel Booking">
                              <span class="material-symbols-outlined">cancel</span>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5">No reservations found.</td></tr>
                  }
                </tbody>
              </table>
            </article>

            @if (activePanel() === 'dashboard') {
              <aside class="admin-actions">
                <h3>Quick Actions</h3>
                <button type="button" (click)="switchPanel('users')">
                  <span class="material-symbols-outlined">manage_accounts</span>
                  <div>
                    <strong>Manage Users</strong>
                    <small>Verify accounts and roles</small>
                  </div>
                </button>
                <button type="button" (click)="switchPanel('properties')">
                  <span class="material-symbols-outlined">edit_note</span>
                  <div>
                    <strong>Manage Properties</strong>
                    <small>Update listing information</small>
                  </div>
                </button>
                <button type="button" (click)="switchPanel('locations')">
                  <span class="material-symbols-outlined">location_on</span>
                  <div>
                    <strong>Manage Locations</strong>
                    <small>View active cities and countries</small>
                  </div>
                </button>
              </aside>
            }
          </section>
        }

        @if (activePanel() === 'users') {
          <section class="admin-panel-card" id="users">
            <article class="admin-table-card">
              <div class="admin-card-head">
                <h3>User Directory</h3>
                <button type="button" (click)="refreshUsers()">Refresh</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of filteredUsers(); track user.id) {
                    <tr>
                      <td>{{ user.first_name }} {{ user.last_name }} ({{ user.username }})</td>
                      <td>{{ user.email }}</td>
                      <td><span class="status-pill active">{{ user.role }}</span></td>
                      <td>
                        @if (user.is_suspended) {
                          <span class="status-pill cancelled">Suspended</span>
                        } @else {
                          <span class="status-pill active">Active</span>
                        }
                      </td>
                      <td>
                        <div class="table-actions">
                          @if (user.role === 'guest') {
                            <button class="btn-icon" (click)="updateUserRole(user.id, 'host')" title="Promote to Host">
                              <span class="material-symbols-outlined">person_add</span>
                            </button>
                          }
                          @if (user.role !== 'admin') {
                            <button class="btn-icon" (click)="updateUserRole(user.id, 'admin')" title="Make Admin">
                              <span class="material-symbols-outlined">verified_user</span>
                            </button>
                          }
                          @if (!user.is_suspended) {
                            <button class="btn-icon delete" (click)="suspendUser(user.id)" title="Suspend User">
                              <span class="material-symbols-outlined">block</span>
                            </button>
                          } @else {
                            <button class="btn-icon" (click)="activateUser(user.id)" title="Activate User" style="background: #e6fff6;">
                              <span class="material-symbols-outlined" style="color: #008558;">check_circle</span>
                            </button>
                          }
                          <button class="btn-icon delete" (click)="deleteUser(user.id)" title="Delete User">
                            <span class="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </article>
          </section>
        }

        @if (activePanel() === 'disputes') {
          <section class="admin-panel-card" id="disputes">
            <article class="admin-table-card">
              <div class="admin-card-head">
                <h3>Booking Disputes</h3>
                <span style="font-size: 0.9rem; color: var(--admin-muted);">{{ disputes().length }} active</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Property</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (dispute of disputes(); track dispute.id) {
                    <tr>
                      <td>{{ dispute.guest_name }}</td>
                      <td>{{ dispute.property_title }}</td>
                      <td>{{ dispute.dispute_reason | slice:0:30 }}...</td>
                      <td><span class="status-pill pending">{{ dispute.dispute_status }}</span></td>
                      <td>
                        <div class="table-actions">
                          @if (dispute.dispute_status !== 'reviewing') {
                            <button class="btn-icon" (click)="markDisputeReviewing(dispute.id)" title="Mark as Under Review">
                              <span class="material-symbols-outlined">assignment</span>
                            </button>
                          }
                          <button class="btn-icon" (click)="resolveDispute(dispute.id)" title="Resolve Dispute">
                            <span class="material-symbols-outlined">check_circle</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5" style="text-align: center; padding: 40px;">No active disputes</td></tr>
                  }
                </tbody>
              </table>
            </article>
          </section>
        }

        @if (activePanel() === 'reviews') {
          <section class="admin-panel-card" id="reviews">
            <article class="admin-table-card">
              <div class="admin-card-head">
                <h3>Review Moderation</h3>
                <span style="font-size: 0.9rem; color: var(--admin-muted);">{{ reviewsForModeration().length }} to review</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Reviewer</th>
                    <th>Property</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (review of reviewsForModeration(); track review.id) {
                    <tr>
                      <td>{{ review.guest_name }}</td>
                      <td>{{ review.property_title }}</td>
                      <td>★ {{ review.rating }}/5</td>
                      <td>{{ review.comment | slice:0:25 }}...</td>
                      <td><span class="status-pill reported">{{ review.moderation_status }}</span></td>
                      <td>
                        <div class="table-actions">
                          <button class="btn-icon" (click)="approveReview(review.id)" title="Approve Review">
                            <span class="material-symbols-outlined">check_circle</span>
                          </button>
                          <button class="btn-icon delete" (click)="hideReview(review.id)" title="Hide Review">
                            <span class="material-symbols-outlined">visibility_off</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" style="text-align: center; padding: 40px;">No reviews to moderate</td></tr>
                  }
                </tbody>
              </table>
            </article>
          </section>
        }

        @if (activePanel() === 'property-approval') {
          <section class="admin-panel-card" id="property-approval">
            <article class="admin-table-card">
              <div class="admin-card-head">
                <h3>Property Approval Queue</h3>
                <span style="font-size: 0.9rem; color: var(--admin-muted);">{{ propertiesForApproval().length }} pending</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Host</th>
                    <th>Type</th>
                    <th>Price/Night</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (property of propertiesForApproval(); track property.id) {
                    <tr>
                      <td>{{ property.title }}</td>
                      <td>{{ property.host_name }}</td>
                      <td>Property</td>
                      <td>-</td>
                      <td><span class="status-pill pending">{{ property.approval_status }}</span></td>
                      <td>
                        <div class="table-actions">
                          @if (property.approval_status === 'pending') {
                            <button class="btn-icon" (click)="approveProperty(property.id)" title="Approve Property">
                              <span class="material-symbols-outlined">check_circle</span>
                            </button>
                            <button class="btn-icon delete" (click)="rejectProperty(property.id)" title="Reject Property">
                              <span class="material-symbols-outlined">cancel</span>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" style="text-align: center; padding: 40px;">No properties pending approval</td></tr>
                  }
                </tbody>
              </table>
            </article>
          </section>
        }

        @if (activePanel() === 'notifications') {
          <section class="admin-panel-card" id="notifications">
            <article class="admin-table-card">
              <div class="admin-card-head">
                <h3>Admin Notifications Center</h3>
                <button type="button" (click)="sendNotification()">Send Notification</button>
              </div>
              <div style="padding: 24px;">
                <p style="color: var(--admin-muted); margin-bottom: 24px;">Use this panel to send important notifications to users across the platform.</p>
                <div style="display: grid; gap: 16px;">
                  <div style="padding: 16px; background: #fdf2f2; border-radius: 8px; border-left: 4px solid var(--admin-primary);">
                    <strong style="display: block; margin-bottom: 4px;">Send to All Users</strong>
                    <p style="margin: 0; font-size: 0.9rem; color: var(--admin-muted);">Broadcast a notification to every user on the platform.</p>
                    <button (click)="sendNotification()" style="margin-top: 12px; padding: 8px 16px; background: var(--admin-primary); color: white; border: 0; border-radius: 6px; cursor: pointer;">Send Broadcast</button>
                  </div>
                </div>
              </div>
            </article>
          </section>
        }

        @if (activePanel() === 'analytics') {
          <section class="admin-panel-card" id="analytics">
            <div class="admin-table-card" style="padding: 32px;">
              <h3>Revenue Performance</h3>
              <p>{{ bookings().length }} reservations have generated {{ revenue() | currency:'XAF' }} in tracked revenue.</p>
              <div class="progress-block" style="margin-top: 24px;">
                <span>Monthly goal progress</span>
                <strong style="display: block; font-size: 2rem; margin: 12px 0;">{{ goalProgress() }}%</strong>
                <div class="progress-bar"><i [style.width.%]="goalProgress()"></i></div>
              </div>
            </div>
          </section>
        }

        @if (activePanel() === 'locations') {
          <section class="admin-panel-card" id="locations">
            <div class="admin-table-card" style="padding: 24px;">
              <h3>Global Presence</h3>
              <p>Active inventory by country.</p>
              <div class="location-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 24px;">
                @for (location of locationStats(); track location.country) {
                  <button type="button" (click)="filterLocation(location.country)" style="padding: 20px; border: 1px solid var(--admin-border); border-radius: 12px; background: #fff; cursor: pointer; text-align: left; transition: all 0.2s;">
                    <strong style="display: block; font-size: 1.1rem;">{{ location.country }}</strong>
                    <span style="color: var(--admin-muted); font-size: 0.9rem;">{{ location.count }} listings</span>
                  </button>
                }
              </div>
            </div>
          </section>
        }

        @if (activePanel() === 'dashboard' || activePanel() === 'properties') {
          <section class="admin-properties" id="properties">
            <div class="admin-card-head flat" style="padding-left: 0; padding-right: 0; border-bottom: 0; margin-bottom: 12px;">
              <h3>{{ activePanel() === 'properties' ? 'All Properties' : 'Top Performing Properties' }}</h3>
              <button type="button" (click)="clearSearch()">Clear Filters</button>
            </div>
            <div class="admin-property-grid">
              @for (property of filteredProperties().slice(0, activePanel() === 'properties' ? 50 : 3); track property.id; let i = $index) {
                <article>
                  <img [src]="propertyImage(i)" [alt]="property.title" />
                  <div class="content">
                    <h4>{{ property.title }}</h4>
                    <p style="color: var(--admin-muted); font-size: 0.9rem; margin-bottom: 4px;">{{ property.city }}, {{ property.country }}</p>
                    <strong class="price">{{ property.price_per_night | currency:'XAF':'symbol':'1.0-0' }} <span style="font-size: 0.8rem; font-weight: 500; color: var(--admin-muted);">/ night</span></strong>
                    <div class="property-actions">
                      <a [routerLink]="['/properties', property.id]">View</a>
                      <button (click)="deleteProperty(property.id)">Delete</button>
                    </div>
                  </div>
                </article>
              } @empty {
                <p class="notice">No properties match your search.</p>
              }
            </div>
          </section>
        }
      </main>
    </section>
  `,
  styles: [`
    .admin-layout {
      --admin-primary: #ba0036;
      --admin-bg: #fcf9f8;
      --admin-sidebar-bg: #ffffff;
      --admin-border: #e5bdbe;
      --admin-text: #1b1c1c;
      --admin-muted: #5c3f41;
      display: grid;
      grid-template-columns: 280px 1fr;
      min-height: 100vh;
      background: var(--admin-bg);
    }

    .admin-sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 32px;
      padding: 32px 20px;
      background: var(--admin-sidebar-bg);
      border-right: 1px solid var(--admin-border);
      box-shadow: 4px 0 12px rgba(0, 0, 0, 0.02);
    }

    .admin-sidebar h1 {
      color: var(--admin-primary);
      font-size: 1.4rem;
      margin-bottom: 4px;
      font-weight: 900;
    }

    .admin-sidebar p {
      font-size: 0.85rem;
      color: var(--admin-muted);
      margin-bottom: 0;
    }

    .admin-sidebar nav {
      display: grid;
      gap: 8px;
    }

    .admin-sidebar nav button {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      border: 0;
      border-radius: 12px;
      background: transparent;
      color: var(--admin-muted);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: left;
    }

    .admin-sidebar nav button:hover {
      background: #fdf2f2;
      color: var(--admin-primary);
      transform: translateX(4px);
    }

    .admin-sidebar nav button.active {
      background: var(--admin-primary);
      color: #ffffff;
      box-shadow: 0 8px 16px rgba(186, 0, 54, 0.2);
    }

    .admin-sidebar nav button.active .material-symbols-outlined {
      color: #ffffff;
    }

    .admin-sidebar .material-symbols-outlined {
      font-size: 22px;
      transition: transform 0.2s ease;
    }

    .admin-sidebar nav button:hover .material-symbols-outlined {
      transform: scale(1.1);
    }

    .admin-add {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px;
      background: #1b1c1c;
      color: #ffffff !important;
      border-radius: 12px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .admin-add:hover {
      background: #000000;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    .admin-main {
      padding: 48px 6vw;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .admin-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 42px;
    }

    .admin-head h2 {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .admin-head p {
      color: var(--admin-muted);
      font-size: 1.05rem;
    }

    .admin-head .actions {
      display: flex;
      gap: 12px;
    }

    .admin-head button, .admin-head a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: #ffffff;
      border: 1px solid var(--admin-border);
      border-radius: 10px;
      color: var(--admin-text);
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .admin-head button:hover {
      background: #f6f3f2;
      border-color: #906f70;
    }

    .admin-head a {
      background: var(--admin-primary);
      color: #ffffff;
      border-color: var(--admin-primary);
    }

    .admin-head a:hover {
      background: #a0002e;
      box-shadow: 0 4px 12px rgba(186, 0, 54, 0.2);
    }

    .admin-search {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      background: #ffffff;
      border: 1px solid var(--admin-border);
      border-radius: 10px;
      width: 320px;
    }

    .admin-search input {
      border: 0;
      padding: 0;
      font-size: 0.95rem;
      width: 100%;
    }

    .admin-search input:focus {
      outline: none;
    }

    .admin-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 42px;
    }

    .admin-stats button {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding: 24px;
      background: #ffffff;
      border: 1px solid var(--admin-border);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      text-align: left;
    }

    .admin-stats button:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
      border-color: var(--admin-primary);
    }

    .admin-stats button .material-symbols-outlined {
      padding: 10px;
      background: #fdf2f2;
      color: var(--admin-primary);
      border-radius: 12px;
      font-size: 28px;
    }

    .admin-stats button p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--admin-muted);
      font-weight: 600;
    }

    .admin-stats button strong {
      font-size: 2rem;
      font-weight: 800;
      color: var(--admin-text);
    }

    .admin-stats button em {
      position: absolute;
      top: 24px;
      right: 24px;
      font-style: normal;
      font-size: 0.8rem;
      font-weight: 700;
      color: #008558;
      background: #e6fff6;
      padding: 4px 8px;
      border-radius: 6px;
    }

    .admin-table-card {
      background: #ffffff;
      border: 1px solid var(--admin-border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }

    .admin-card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid var(--admin-border);
    }

    .admin-card-head h3 {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0;
    }

    .admin-card-head button {
      padding: 8px 16px;
      background: #f6f3f2;
      border: 0;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .admin-card-head button:hover {
      background: var(--admin-border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #fcf9f8;
      padding: 16px 24px;
      text-align: left;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--admin-muted);
      font-weight: 700;
    }

    td {
      padding: 18px 24px;
      border-bottom: 1px solid #f6f3f2;
      font-size: 0.95rem;
    }

    tr:last-child td {
      border-bottom: 0;
    }

    .status-pill {
      display: inline-flex;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: capitalize;
    }

    .status-pill.active, .status-pill.confirmed { background: #e6fff6; color: #008558; }
    .status-pill.cancelled { background: #fff1f1; color: #ba0036; }
    .status-pill.pending { background: #fff8e6; color: #855800; }
    .status-pill.reported { background: #fff1f1; color: #ba0036; }
    .status-pill.reviewing { background: #fff8e6; color: #855800; }
    .status-pill.resolved { background: #e6fff6; color: #008558; }
    .status-pill.clean { background: #e6fff6; color: #008558; }
    .status-pill.hidden { background: #f0f0f0; color: #666; }
    .status-pill.approved { background: #e6fff6; color: #008558; }
    .status-pill.rejected { background: #fff1f1; color: #ba0036; }

    .table-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #f6f3f2;
      border: 1px solid var(--admin-border);
      border-radius: 8px;
      color: var(--admin-muted);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-icon:hover {
      background: #ffffff;
      border-color: var(--admin-primary);
      color: var(--admin-primary);
      transform: scale(1.05);
    }

    .btn-icon.delete:hover {
      background: var(--admin-primary);
      color: #ffffff;
      border-color: var(--admin-primary);
    }

    .admin-actions {
      display: grid;
      gap: 12px;
    }

    .admin-actions button {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #ffffff;
      border: 1px solid var(--admin-border);
      border-radius: 12px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
    }

    .admin-actions button:hover {
      border-color: var(--admin-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transform: translateX(4px);
    }

    .admin-actions strong {
      display: block;
      font-size: 1rem;
      margin-bottom: 2px;
    }

    .admin-actions small {
      color: var(--admin-muted);
      font-size: 0.8rem;
    }

    .admin-property-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .admin-property-grid article {
      background: #ffffff;
      border: 1px solid var(--admin-border);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .admin-property-grid article:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
    }

    .admin-property-grid img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .admin-property-grid .content {
      padding: 20px;
    }

    .admin-property-grid h4 {
      margin: 0 0 6px;
      font-size: 1.1rem;
      font-weight: 800;
    }

    .admin-property-grid .price {
      display: block;
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--admin-primary);
      margin: 12px 0;
    }

    .property-actions {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }

    .property-actions a, .property-actions button {
      flex: 1;
      padding: 10px;
      border-radius: 8px;
      font-weight: 700;
      text-align: center;
      text-decoration: none;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .property-actions a {
      background: #f6f3f2;
      color: var(--admin-text);
      border: 1px solid var(--admin-border);
    }

    .property-actions a:hover {
      background: #ffffff;
      border-color: #906f70;
    }

    .property-actions button {
      background: transparent;
      border: 1px solid var(--admin-primary);
      color: var(--admin-primary);
    }

    .property-actions button:hover {
      background: var(--admin-primary);
      color: #ffffff;
    }

    .progress-bar {
      height: 10px;
      background: #f6f3f2;
      border-radius: 999px;
      overflow: hidden;
      margin-top: 12px;
    }

    .progress-bar i {
      display: block;
      height: 100%;
      background: var(--admin-primary);
      border-radius: 999px;
      transition: width 1s ease-out;
    }

    .toast {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: #1b1c1c;
      color: #ffffff;
      padding: 14px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      font-weight: 600;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 1024px) {
      .admin-layout {
        grid-template-columns: 1fr;
      }
      .admin-sidebar {
        height: auto;
        position: static;
        border-right: 0;
        border-bottom: 1px solid var(--admin-border);
        padding: 20px;
      }
      .admin-sidebar nav {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }
      .admin-add { display: none; }
      .admin-stats { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 768px) {
      .admin-head {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
      }
      .admin-head .actions {
        width: 100%;
        flex-direction: column;
      }
      .admin-search { width: 100%; }
      .admin-head button, .admin-head a { width: 100%; justify-content: center; }
      .admin-grid { grid-template-columns: 1fr; }
      .admin-property-grid { grid-template-columns: 1fr; }
      .admin-stats { grid-template-columns: 1fr; }
      table { display: block; overflow-x: auto; }
    }
  `]
})
export class AdminDashboardPage {
  private readonly bookingApi = inject(BookingService);
  private readonly propertyApi = inject(PropertyService);
  private readonly userApi = inject(UserService);
  private readonly adminApi = inject(AdminService);
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);

  protected readonly bookings = signal<Booking[]>([]);
  protected readonly properties = signal<Property[]>([]);
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly disputes = signal<Dispute[]>([]);
  protected readonly reviewsForModeration = signal<ReviewModeration[]>([]);
  protected readonly propertiesForApproval = signal<PropertyModeration[]>([]);
  protected readonly activePanel = signal<AdminPanel>('dashboard');
  protected readonly search = signal('');
  protected readonly notice = signal('');
  protected readonly revenueStats = signal<any>({});
  protected readonly paymentStats = signal<any>({});
  protected readonly disputeStats = signal<any>({});
  protected readonly reviewStats = signal<any>({});
  protected readonly propertyStats = signal<any>({});

  protected readonly revenue = computed(() => this.bookings().reduce((sum, item) => sum + Number(item.total_price || 0), 0));
  protected readonly goalProgress = computed(() => Math.min(100, Math.round((this.revenue() / 10000) * 100)));

  protected readonly filteredBookings = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.bookings();
    return this.bookings().filter((booking) =>
      [booking.property_title, booking.status, booking.check_in, booking.check_out, booking.total_price]
        .some((value) => String(value).toLowerCase().includes(term))
    );
  });

  protected readonly filteredProperties = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.properties();
    return this.properties().filter((property) =>
      [property.title, property.city, property.country, property.property_type, property.price_per_night]
        .some((value) => String(value).toLowerCase().includes(term))
    );
  });

  protected readonly filteredUsers = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.users();
    return this.users().filter((user) =>
      [user.username, user.email, user.first_name, user.last_name, user.role]
        .some((value) => String(value).toLowerCase().includes(term))
    );
  });

  protected readonly locationStats = computed(() => {
    const totals = new Map<string, number>();
    this.properties().forEach((property) => totals.set(property.country, (totals.get(property.country) ?? 0) + 1));
    return Array.from(totals.entries()).map(([country, count]) => ({ country, count }));
  });

  private readonly images = [
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85'
  ];

  constructor() {
    this.refreshAll();
  }

  refreshAll(): void {
    this.bookingApi.list().subscribe((page) => this.bookings.set(page.results));
    this.propertyApi.list().subscribe((page) => this.properties.set(page.results));
    this.userApi.list().subscribe((page) => this.users.set(page.results as any));
    this.adminApi.getDisputes().subscribe((disputes) => this.disputes.set(disputes));
    this.adminApi.getReviewsForModeration().subscribe((reviews) => this.reviewsForModeration.set(reviews));
    this.adminApi.getPropertiesForApproval().subscribe((props) => this.propertiesForApproval.set(props));
    this.adminApi.getPaymentStats().subscribe((stats) => {
      this.paymentStats.set(stats);
      this.revenueStats.set({ total: stats.total_revenue, refunded: stats.total_refunded });
    });
    this.adminApi.getDisputeStats().subscribe((stats) => this.disputeStats.set(stats));
    this.adminApi.getReviewStats().subscribe((stats) => this.reviewStats.set(stats));
    this.adminApi.getPropertyStats().subscribe((stats) => this.propertyStats.set(stats));
  }

  refreshUsers(): void {
    this.userApi.list().subscribe((page) => {
      this.users.set(page.results as AdminUser[]);
      this.showNotice('User list refreshed.');
    });
  }

  pageTitle(): string {
    const titles: Record<AdminPanel, string> = {
      dashboard: 'Dashboard Overview',
      properties: 'Property Listings',
      'property-approval': 'Property Approval',
      reservations: 'Reservations',
      disputes: 'Booking Disputes',
      reviews: 'Review Moderation',
      users: 'User Management',
      notifications: 'Admin Notifications',
      analytics: 'Analytics',
      locations: 'Locations'
    };
    return titles[this.activePanel()];
  }

  pageSubtitle(): string {
    const subtitles: Record<AdminPanel, string> = {
      dashboard: 'Welcome back. Here is what is happening today across AelithraStay.',
      'property-approval': 'Review and approve property listings before they go live.',
      disputes: 'Manage and resolve booking disputes.',
      reviews: 'Moderate reviews and manage reported content.',
      notifications: 'Send notifications to users.',
      analytics: 'View platform revenue and analytics.',
      locations: 'View active cities and countries.',
      properties: 'Manage all property listings.',
      reservations: 'View and manage all reservations.',
      users: 'Manage user accounts and roles.'
    };
    return subtitles[this.activePanel()];
  }

  propertyImage(index: number): string {
    return this.images[index % this.images.length];
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  switchPanel(panel: AdminPanel): void {
    this.activePanel.set(panel);
    window.setTimeout(() => document.getElementById(panel === 'dashboard' ? 'reservations' : panel)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  openBooking(id: number): void {
    this.router.navigate(['/booking-confirmation', id]);
  }

  cancelBooking(id: number): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingApi.update(id, { status: 'cancelled' }).subscribe(() => {
        this.bookings.update(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        this.showNotice('Booking cancelled successfully.');
      });
    }
  }

  deleteProperty(id: number): void {
    if (confirm('Are you sure you want to delete this property?')) {
      this.propertyApi.delete(id).subscribe(() => {
        this.properties.update(ps => ps.filter(p => p.id !== id));
        this.showNotice('Property deleted successfully.');
      });
    }
  }

  updateUserRole(id: number, role: 'admin' | 'host' | 'guest'): void {
    this.userApi.update(id, { role }).subscribe((updatedUser) => {
      this.users.update(us => us.map(u => u.id === id ? updatedUser as AdminUser : u));
      this.showNotice(`User role updated to ${role}.`);
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.userApi.delete(id).subscribe(() => {
        this.users.update(us => us.filter(u => u.id !== id));
        this.showNotice('User deleted successfully.');
      });
    }
  }

  filterLocation(country: string): void {
    this.search.set(country);
    this.activePanel.set('properties');
    this.showNotice(`Showing listings in ${country}.`);
  }

  clearSearch(): void {
    this.search.set('');
    this.showNotice('Filters cleared.');
  }

  exportReport(): void {
    const rows = [
      ['Metric', 'Value'],
      ['Total users', this.users().length],
      ['Active listings', this.properties().length],
      ['Total reservations', this.bookings().length],
      ['Revenue', this.revenue()]
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'aelithrastay-admin-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    this.showNotice('Admin report exported.');
  }

  showNotice(message: string): void {
    this.notice.set(message);
    window.setTimeout(() => this.notice.set(''), 2600);
  }

  // DISPUTE MANAGEMENT
  resolveDispute(id: number): void {
    const resolution = prompt('Enter resolution details:');
    if (resolution) {
      this.adminApi.resolveDispute(id, resolution).subscribe(() => {
        this.disputes.update(ds => ds.filter(d => d.id !== id));
        this.showNotice('Dispute resolved successfully.');
      });
    }
  }

  markDisputeReviewing(id: number): void {
    this.adminApi.markDisputeReviewing(id).subscribe(() => {
      this.showNotice('Dispute marked as under review.');
      this.refreshAll();
    });
  }

  // REVIEW MODERATION
  hideReview(id: number): void {
    const note = prompt('Enter reason for hiding this review:');
    if (note) {
      this.adminApi.hideReview(id, note).subscribe(() => {
        this.reviewsForModeration.update(rs => rs.filter(r => r.id !== id));
        this.showNotice('Review hidden successfully.');
      });
    }
  }

  approveReview(id: number): void {
    this.adminApi.resolveReviewReport(id, 'Approved').subscribe(() => {
      this.reviewsForModeration.update(rs => rs.filter(r => r.id !== id));
      this.showNotice('Review approved.');
    });
  }

  // PROPERTY APPROVAL
  approveProperty(id: number): void {
    const note = prompt('Enter approval notes (optional):');
    this.adminApi.approveProperty(id, note || undefined).subscribe(() => {
      this.propertiesForApproval.update(ps => ps.filter(p => p.id !== id));
      this.showNotice('Property approved successfully.');
    });
  }

  rejectProperty(id: number): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.adminApi.rejectProperty(id, reason).subscribe(() => {
        this.propertiesForApproval.update(ps => ps.filter(p => p.id !== id));
        this.showNotice('Property rejected.');
      });
    }
  }

  // USER MANAGEMENT - NEW
  suspendUser(id: number): void {
    if (confirm('Are you sure you want to suspend this user?')) {
      this.adminApi.suspendUser(id).subscribe(() => {
        this.users.update(us => us.map(u => u.id === id ? { ...u, is_suspended: true } : u));
        this.showNotice('User suspended successfully.');
      });
    }
  }

  activateUser(id: number): void {
    this.adminApi.activateUser(id).subscribe(() => {
      this.users.update(us => us.map(u => u.id === id ? { ...u, is_suspended: false } : u));
      this.showNotice('User activated successfully.');
    });
  }

  // NOTIFICATIONS
  sendNotification(): void {
    const titlePrompt = prompt('Notification title:');
    if (!titlePrompt) return;
    const messagePrompt = prompt('Notification message:');
    if (!messagePrompt) return;
    this.adminApi.sendNotificationToAll(titlePrompt, messagePrompt).subscribe(() => {
      this.showNotice('Notification sent to all users.');
    });
  }
}
