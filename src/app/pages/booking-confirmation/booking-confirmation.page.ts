import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Booking } from '../../core/models';
import { BookingService } from '../../core/booking.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-booking-confirmation-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="confirmation-page">
      <header class="confirm-hero">
        <div class="confirm-icon"><span class="material-symbols-outlined">check_circle</span></div>
        <h1>{{ language.t('reservationConfirmed') }}</h1>
        <p>{{ language.t('confirmationEmailSent') }}</p>
        <span class="confirm-code">{{ language.t('confirmationCode') }}: {{ code() }}</span>
      </header>

      @if (booking(); as item) {
        <article class="confirm-card">
          <section class="confirm-property">
            <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85" [alt]="item.property_title" />
            <div>
              <span class="eyebrow">AelithraStay {{ language.t('reservation') }}</span>
              <h2>{{ item.property_title }}</h2>
              <p class="muted">{{ language.t('hostedStay') }} · {{ item.status }}</p>
              <div class="host-mini">
                <span class="material-symbols-outlined">account_circle</span>
                <div>
                  <strong>{{ language.t('hostIsReady') }}</strong>
                  <p>{{ language.t('checkInDetails') }}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="confirm-summary">
            <div>
              <h3>{{ language.t('reservationDetails') }}</h3>
              <p><span class="material-symbols-outlined">calendar_today</span>{{ item.check_in | date:'mediumDate' }} to {{ item.check_out | date:'mediumDate' }}</p>
              <p><span class="material-symbols-outlined">group</span>{{ item.guests }} {{ language.t('guestsCount') }} · {{ item.nights }} {{ language.t('night') }}{{ item.nights > 1 ? 's' : '' }}</p>
            </div>
            <div>
              <h3>{{ language.t('priceBreakdown') }}</h3>
              <div class="price-line"><span>{{ language.t('stayTotal') }}</span><strong>{{ item.total_price | currency:'XAF' }}</strong></div>
              <div class="price-line"><span>Status</span><strong>{{ item.status }}</strong></div>
            </div>
          </section>

          <footer class="confirm-actions">
            <a routerLink="/bookings"><span class="material-symbols-outlined">flight_takeoff</span>{{ language.t('viewTrips') }}</a>
            <a routerLink="/profile"><span class="material-symbols-outlined">chat_bubble</span>{{ language.t('contactHost') }}</a>
            <button type="button" (click)="print()"><span class="material-symbols-outlined">picture_as_pdf</span>{{ language.t('printPdf') }}</button>
          </footer>
        </article>
      } @else {
        <p class="notice">{{ language.t('loadingConfirmation') }}</p>
      }

      <section class="help-card-grid">
        <article><span class="material-symbols-outlined">location_on</span><h3>{{ language.t('gettingThere') }}</h3><p>{{ language.t('arrivalInstructions') }}</p></article>
        <article><span class="material-symbols-outlined">policy</span><h3>{{ language.t('cancellationPolicy') }}</h3><p>{{ language.t('reviewTripPolicies') }}</p></article>
        <article><span class="material-symbols-outlined">help</span><h3>{{ language.t('needHelp') }}</h3><p>{{ language.t('reachSupport') }}</p></article>
      </section>
    </section>
  `
})
export class BookingConfirmationPage {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingsApi = inject(BookingService);
  protected readonly language = inject(LanguageService);

  protected readonly booking = signal<Booking | null>(null);
  protected readonly code = signal('AEL-' + Math.random().toString(36).slice(2, 10).toUpperCase());

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookingsApi.detail(id).subscribe((booking) => this.booking.set(booking));
  }

  print(): void {
    window.print();
  }
}
