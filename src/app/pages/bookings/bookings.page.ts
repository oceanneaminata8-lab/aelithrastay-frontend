import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Booking } from '../../core/models';
import { BookingService } from '../../core/booking.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-bookings-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="trips-page">
      <header class="trips-header">
        <span class="eyebrow">{{ language.t('trips') }}</span>
        <h1>{{ language.t('upcomingReservations') }}</h1>
        <p>{{ language.t('allUpcomingReservations') }}</p>
      </header>

      <section class="trips-section">
        <div class="trip-grid">
          @for (booking of bookings(); track booking.id; let i = $index) {
            <a class="trip-card-v2" [routerLink]="['/booking-confirmation', booking.id]">
              <div class="trip-image-v2">
                <img [src]="tripImage(i)" [alt]="booking.property_title" />
                <div class="status-badge">{{ booking.status }}</div>
              </div>
              <div class="trip-details">
                <div class="trip-meta-v2">
                  <span class="stay-type">{{ language.t('stay') }}</span>
                  <span class="dates">{{ booking.check_in | date:'MMM d' }} – {{ booking.check_out | date:'MMM d' }}</span>
                </div>
                <h3>{{ booking.property_title }}</h3>
                <div class="trip-footer-v2">
                  <div class="guests">
                    <span class="material-symbols-outlined">group</span>
                    {{ booking.guests }} {{ language.t('guestsCount') }}
                  </div>
                  <div class="price">
                    {{ booking.total_price | currency:'XAF' }}
                  </div>
                </div>
              </div>
            </a>
          } @empty {
            <div class="empty-state">
              <span class="material-symbols-outlined">hotel_class</span>
              <h3>{{ language.t('noReservationsYet') }}</h3>
              <p>{{ language.t('bookFirstStay') }}</p>
              <a routerLink="/" class="btn-primary">{{ language.t('startExploring') }}</a>
            </div>
          }
        </div>
      </section>

      <hr class="section-divider" />

      <section class="past-trips-section">
        <div class="section-head-v2">
          <div>
            <h3>{{ language.t('whereYouveBeen') }}</h3>
            <p>{{ language.t('reliveMemories') }}</p>
          </div>
          <button type="button" class="btn-view-all" (click)="showNotice()">
            {{ language.t('viewAll') }} 
            <span class="material-symbols-outlined">history</span>
          </button>
        </div>
        <div class="past-trip-grid-v2">
          @for (trip of pastTrips; track trip.place) {
            <button type="button" class="past-trip-card-v2">
              <div class="img-container">
                <img [src]="trip.image" [alt]="trip.place" />
              </div>
              <div class="past-meta">
                <strong>{{ trip.place }}</strong>
                <span>{{ trip.date }} · {{ trip.type }}</span>
              </div>
            </button>
          }
        </div>
      </section>

      <section class="help-banner">
        <div>
          <h3>{{ language.t('cantFindReservation') }}</h3>
          <p>{{ language.t('cantFindReservationDesc') }}</p>
        </div>
        <a routerLink="/profile" class="btn-outline-white">{{ language.t('visitHelpCenter') }}</a>
      </section>

      @if (notice()) {
        <p class="toast-notification show">{{ notice() }}</p>
      }
    </section>
  `,
  styles: [`
    .trips-page { max-width: 1200px; margin: 0 auto; padding: 64px 24px; }
    .trips-header { margin-bottom: 48px; }
    .eyebrow { color: #ba0036; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; display: block; }
    h1 { font-size: 3rem; font-weight: 900; margin: 0 0 8px; letter-spacing: -0.02em; }
    .trips-header p { font-size: 1.1rem; color: #5c3f41; }
    
    .trip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 32px; }
    
    .trip-card-v2 { text-decoration: none; color: inherit; display: flex; flex-direction: column; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 32px rgba(0,0,0,0.06); transition: all 0.3s ease; border: 1px solid #f0eded; }
    .trip-card-v2:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    
    .trip-image-v2 { position: relative; height: 220px; }
    .trip-image-v2 img { width: 100%; height: 100%; object-fit: cover; }
    .status-badge { position: absolute; top: 16px; right: 16px; background: #e6fff6; color: #008558; padding: 6px 14px; border-radius: 99px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    
    .trip-details { padding: 24px; display: grid; gap: 12px; }
    .trip-meta-v2 { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 700; color: #5c3f41; }
    .stay-type { color: #ba0036; text-transform: uppercase; }
    .trip-details h3 { font-size: 1.3rem; font-weight: 800; margin: 0; }
    
    .trip-footer-v2 { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid #f6f3f2; }
    .guests { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.9rem; color: #888; }
    .guests .material-symbols-outlined { font-size: 20px; }
    .price { font-weight: 800; font-size: 1.1rem; color: #ba0036; }
    
    .section-divider { border: 0; border-top: 1px solid #eee; margin: 64px 0; }
    
    .section-head-v2 { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
    .section-head-v2 h3 { font-size: 1.8rem; font-weight: 800; margin: 0 0 4px; }
    .section-head-v2 p { color: #5c3f41; margin: 0; }
    .btn-view-all { 
      display: flex;
      align-items: center;
      gap: 10px;
      background: #ffffff; 
      border: 2px solid #ba0036; 
      color: #ba0036; 
      font-weight: 800; 
      font-size: 0.95rem; 
      cursor: pointer; 
      padding: 10px 20px;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-view-all:hover {
      background: #ba0036;
      color: #ffffff;
      box-shadow: 0 6px 16px rgba(186, 0, 54, 0.25);
      transform: translateY(-2px);
    }
    .btn-view-all .material-symbols-outlined {
      font-size: 18px;
    }
    
    .past-trip-grid-v2 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    .past-trip-card-v2 { background: transparent; border: 0; padding: 0; cursor: pointer; text-align: left; transition: transform 0.2s; }
    .past-trip-card-v2:hover { transform: scale(1.02); }
    .img-container { aspect-ratio: 1; border-radius: 16px; overflow: hidden; margin-bottom: 12px; }
    .img-container img { width: 100%; height: 100%; object-fit: cover; }
    .past-meta strong { display: block; font-size: 1rem; margin-bottom: 2px; }
    .past-meta span { color: #5c3f41; font-size: 0.85rem; }
    
    .help-banner { margin-top: 80px; background: #1b1c1c; color: #fff; padding: 48px; border-radius: 32px; display: flex; justify-content: space-between; align-items: center; }
    .help-banner h3 { font-size: 1.6rem; font-weight: 800; margin: 0 0 8px; }
    .help-banner p { margin: 0; opacity: 0.8; }
    .btn-outline-white { background: transparent; border: 2px solid #fff; color: #fff !important; padding: 14px 28px; border-radius: 14px; font-weight: 800; text-decoration: none; transition: all 0.2s; }
    .btn-outline-white:hover { background: #fff; color: #1b1c1c !important; }
    
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 80px 0; }
    .empty-state .material-symbols-outlined { font-size: 64px; color: #ccc; margin-bottom: 16px; }
    .btn-primary { display: inline-block; margin-top: 24px; padding: 14px 40px; background: #ba0036; color: white !important; border-radius: 16px; font-weight: 800; text-decoration: none; }
    
    .toast-notification { position: fixed; bottom: 32px; right: 32px; background: #1b1c1c; color: #fff; padding: 16px 24px; border-radius: 16px; font-weight: 700; opacity: 0; transform: translateY(20px); transition: all 0.3s; z-index: 2000; }
    .toast-notification.show { opacity: 1; transform: translateY(0); }

    @media (max-width: 900px) {
      .trip-grid { grid-template-columns: 1fr; }
      .past-trip-grid-v2 { grid-template-columns: 1fr 1fr; }
      .help-banner { flex-direction: column; text-align: center; gap: 32px; }
      h1 { font-size: 2.2rem; }
    }
  `]
})
export class BookingsPage {
  private readonly bookingsApi = inject(BookingService);
  protected readonly language = inject(LanguageService);
  protected readonly bookings = signal<Booking[]>([]);

  protected readonly pastTrips = [
    { place: 'Aspen, Colorado', date: 'Sep 2024', type: 'Mountain Cabin', image: 'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=700&q=85' },
    { place: 'Tulum, Mexico', date: 'Jun 2024', type: 'Beach Front', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=85' },
    { place: 'Tokyo, Japan', date: 'Mar 2024', type: 'City View', image: 'https://images.unsplash.com/photo-1540959733332-e2ab4deabeeaf?auto=format&fit=crop&w=700&q=85' },
    { place: 'Rome, Italy', date: 'Dec 2023', type: 'Historic Center', image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=700&q=85' }
  ];

  protected readonly notice = signal('');

  private readonly images = [

    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85'
  ];

  constructor() {
    this.bookingsApi.list().subscribe((page) => this.bookings.set(page.results));
  }

  showNotice(): void {
    this.notice.set(this.language.t('historicalTripsSync'));
    window.setTimeout(() => this.notice.set(''), 3000);
  }

  tripImage(index: number): string {
    return this.images[index % this.images.length];
  }
}
