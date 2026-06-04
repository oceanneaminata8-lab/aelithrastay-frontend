import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '../../core/booking.service';
import { Property, Review } from '../../core/models';
import { PropertyService } from '../../core/property.service';
import { ReviewService } from '../../core/review.service';
import { WishlistService } from '../../core/wishlist.service';
import { AuthService } from '../../core/auth.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-property-detail-page',
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    @if (property(); as stay) {
      <main class="property-detail-container">
        <header class="detail-header">
          <div class="header-top">
            <a routerLink="/" class="back-link">
              <span class="material-symbols-outlined">arrow_back</span>
              {{ language.t('exploreStays') }}
            </a>
            <div class="header-actions">
              <button type="button" class="action-btn" (click)="share()">
                <span class="material-symbols-outlined">share</span>
                {{ language.t('share') }}
              </button>
              <button type="button" class="action-btn" (click)="addWishlist(stay.id)" [disabled]="isAddingWishlist()">
                <span class="material-symbols-outlined">{{ isAddingWishlist() ? 'hourglass_top' : 'favorite' }}</span>
                {{ isAddingWishlist() ? language.t('saving') : language.t('save') }}
              </button>
            </div>
          </div>
          <h1>{{ stay.title }}</h1>
          <div class="header-meta">
            <div class="rating">
              <span class="material-symbols-outlined">star</span>
              <strong>{{ stay.average_rating || language.t('new') }}</strong>
              <span class="muted">({{ stay.review_count }} {{ language.t('reviewsCount') }})</span>
            </div>
            <span class="separator">·</span>
            <address>{{ stay.city }}, {{ stay.country }}</address>
          </div>
        </header>

        <section class="image-gallery">
          @if (stay.images.length > 0) {
            <div class="gallery-grid" [class.single]="stay.images.length === 1">
              <div class="main-image">
                <img [src]="stay.images[0].image" [alt]="stay.title" />
              </div>
              @if (stay.images.length > 1) {
                <div class="side-images">
                  @for (img of stay.images.slice(1, 5); track img.id) {
                    <img [src]="img.image" [alt]="stay.title" />
                  }
                </div>
              }
            </div>
          } @else {
            <div class="gallery-grid">
              <div class="main-image">
                <img [src]="fallbackImage(0)" [alt]="stay.title" />
              </div>
              <div class="side-images">
                <img [src]="fallbackImage(1)" [alt]="stay.title" />
                <img [src]="fallbackImage(2)" [alt]="stay.title" />
                <img [src]="fallbackImage(3)" [alt]="stay.title" />
                <img [src]="fallbackImage(4)" [alt]="stay.title" />
              </div>
            </div>
          }
        </section>

        <div class="content-layout">
          <section class="main-content">
            <div class="host-info">
              <div>
                <h2>{{ language.t('entire') }} {{ stay.property_type }} {{ language.t('hostedBy') }} {{ stay.host }}</h2>
                <p>
                  {{ stay.max_guests }} {{ language.t('guestsCount') }} · 
                  {{ stay.bedrooms }} {{ stay.bedrooms > 1 ? language.t('bedrooms') : language.t('bedroom') }} · 
                  {{ stay.beds }} {{ stay.beds > 1 ? language.t('beds') : language.t('bed') }} · 
                  {{ stay.bathrooms }} {{ +stay.bathrooms > 1 ? language.t('baths') : language.t('bath') }}
                </p>
              </div>
              <div class="host-avatar">
                <span class="material-symbols-outlined">account_circle</span>
              </div>
            </div>

            <hr class="divider" />

            <div class="highlights">
              <div class="highlight-item">
                <span class="material-symbols-outlined">workspace_premium</span>
                <div>
                  <strong>{{ stay.host }} {{ language.t('superhost') }}</strong>
                  <p>{{ language.t('superhostDesc') }}</p>
                </div>
              </div>
              <div class="highlight-item">
                <span class="material-symbols-outlined">location_on</span>
                <div>
                  <strong>{{ language.t('greatLocation') }}</strong>
                  <p>{{ language.t('greatLocationDesc') }}</p>
                </div>
              </div>
              <div class="highlight-item">
                <span class="material-symbols-outlined">calendar_today</span>
                <div>
                  <strong>{{ language.t('freeCancellation') }}</strong>
                  <p>{{ language.t('freeCancellationDesc') }}</p>
                </div>
              </div>
            </div>

            <hr class="divider" />

            <article class="description">
              <h3>{{ language.t('aboutPlace') }}</h3>
              <p [class.expanded]="showFullDescription()">{{ stay.description }}</p>
              <button class="show-more" (click)="showFullDescription.set(!showFullDescription())">
                {{ showFullDescription() ? language.t('showLess') : language.t('showMore') }} 
                <span class="material-symbols-outlined">{{ showFullDescription() ? 'expand_less' : 'chevron_right' }}</span>
              </button>
            </article>

            <hr class="divider" />

            <section class="amenities">
              <h3>{{ language.t('offers') }}</h3>
              <div class="amenity-grid" [class.all]="showAllAmenities()">
                @for (amenity of (showAllAmenities() ? stay.amenities : stay.amenities.slice(0, 6)); track amenity.id) {
                  <div class="amenity-item">
                    <span class="material-symbols-outlined">{{ amenity.icon || 'check_circle' }}</span>
                    <span>{{ amenity.name }}</span>
                  </div>
                } @empty {
                  <p class="muted">{{ language.t('essentialAmenities') }}</p>
                }
              </div>
              @if (stay.amenities.length > 6) {
                <button class="btn-outline" (click)="showAllAmenities.set(!showAllAmenities())">
                  {{ showAllAmenities() ? language.t('hideAmenities') : language.t('showAllAmenities') + ' ' + stay.amenities.length + ' amenities' }}
                </button>
              }
            </section>

            <hr class="divider" />

            <section class="reviews-section">
              <div class="reviews-header">
                <h3>
                  <span class="material-symbols-outlined">star</span>
                  {{ stay.average_rating || language.t('new') }} · {{ stay.review_count }} {{ language.t('reviewsCount') }}
                </h3>
              </div>
              
              <form class="review-form" [formGroup]="reviewForm" (ngSubmit)="review(stay.id)">
                <h4>{{ language.t('leaveReview') }}</h4>
                <div class="rating-input">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" (click)="reviewForm.patchValue({rating: star})">
                      <span class="material-symbols-outlined" [class.filled]="reviewForm.getRawValue().rating >= star">star</span>
                    </button>
                  }
                </div>
                <textarea formControlName="comment" [placeholder]="language.t('howWasStay')"></textarea>
                <button type="submit" class="btn-post-review" [disabled]="reviewForm.invalid || isSubmittingReview()">
                  {{ isSubmittingReview() ? language.t('posting') : language.t('postReview') }}
                  <span class="material-symbols-outlined">send</span>
                </button>
              </form>

              <div class="review-list">
                @for (item of reviews(); track item.id) {
                  <article class="review-card">
                    <div class="review-user">
                      <div class="mini-avatar">
                        <span class="material-symbols-outlined">account_circle</span>
                      </div>
                      <div>
                        <strong>{{ item.guest }}</strong>
                        <p class="muted">{{ item.created_at | date:'MMMM yyyy' }}</p>
                      </div>
                    </div>
                    <p class="review-text">{{ item.comment }}</p>
                  </article>
                } @empty {
                  <div class="empty-reviews">
                    <p>{{ language.t('noReviewsYet') }}</p>
                  </div>
                }
              </div>
            </section>
          </section>

          <aside class="sidebar-content">
            <div class="booking-card">
              <div class="price-header">
                <div>
                  <span class="amount">{{ stay.price_per_night | currency:'XAF':'symbol':'1.0-0' }}</span>
                  <span class="unit">{{ language.t('night') }}</span>
                </div>
                <div class="rating-summary">
                  <span class="material-symbols-outlined">star</span>
                  <strong>{{ stay.average_rating || language.t('new') }}</strong>
                </div>
              </div>

              <form class="booking-form" [formGroup]="bookingForm" (ngSubmit)="book(stay.id)">
                <div class="date-inputs">
                  <label class="check-in">
                    <span>{{ language.t('checkIn') }}</span>
                    <input formControlName="check_in" type="date" />
                  </label>
                  <label class="check-out">
                    <span>{{ language.t('checkOut') }}</span>
                    <input formControlName="check_out" type="date" />
                  </label>
                </div>
                <label class="guest-input">
                  <span>{{ language.t('guests') }}</span>
                  <input formControlName="guests" type="number" min="1" [max]="stay.max_guests" />
                </label>
                <button type="submit" class="book-btn" [disabled]="bookingForm.invalid || isSubmittingBooking()">
                  {{ isSubmittingBooking() ? language.t('reserving') : language.t('reserve') }}
                </button>
                <p class="charge-notice">{{ language.t('wonChargeYet') }}</p>
              </form>

              <div class="payment-control">
                <button type="button" class="btn-outline payment-toggle" (click)="togglePaymentOptions()">
                  <span class="material-symbols-outlined">payment</span>
                  {{ language.t('paymentMode') }}
                  <span class="material-symbols-outlined">{{ showPaymentOptions() ? 'expand_less' : 'expand_more' }}</span>
                </button>
                <p class="payment-hint">
                  {{ paymentConfirmed() ? language.t('paymentModeSelected') + ' ' + paymentLabel(paymentForm.value.method || 'card') + ' — ' + language.t('paymentOptionHint') : language.t('paymentOptionHint') }}
                </p>
              </div>

              @if (showPaymentOptions()) {
                <section class="payment-panel" [formGroup]="paymentForm">
                  <div class="payment-panel-header">
                    <div>
                      <strong>{{ language.t('addPaymentMethod') }}</strong>
                      <p>{{ language.t('paymentPanelDescription') }}</p>
                    </div>
                    <button type="button" class="btn-plain" (click)="showPaymentOptions.set(false)">{{ language.t('close') }}</button>
                  </div>

                  <div class="payment-method-grid">
                    <button type="button" [class.active]="selectedPaymentMethod() === 'card'" (click)="selectPaymentMethod('card')">
                      {{ language.t('paymentCardLabel') }}
                    </button>
                    <button type="button" [class.active]="selectedPaymentMethod() === 'paypal'" (click)="selectPaymentMethod('paypal')">
                      PayPal
                    </button>
                    <button type="button" [class.active]="selectedPaymentMethod() === 'googlepay'" (click)="selectPaymentMethod('googlepay')">
                      Google Pay
                    </button>
                  </div>

                  @if (selectedPaymentMethod() === 'card') {
                    <div class="payment-card-fields">
                      <label>
                        <span>{{ language.t('paymentCardLabel') }}</span>
                        <input type="text" formControlName="cardNumber" placeholder="{{ language.t('cardNumber') }}" />
                      </label>
                      <div class="payment-row">
                        <label>
                          <span>{{ language.t('expiry') }}</span>
                          <input type="text" formControlName="expiry" placeholder="MM/YY" />
                        </label>
                        <label>
                          <span>{{ language.t('cvc') }}</span>
                          <input type="text" formControlName="cvc" placeholder="CVC" />
                        </label>
                      </div>
                      <label>
                        <span>{{ language.t('postalCode') }}</span>
                        <input type="text" formControlName="postalCode" placeholder="75001" />
                      </label>
                      <label>
                        <span>{{ language.t('countryRegion') }}</span>
                        <select formControlName="country">
                          <option>France</option>
                          <option>Cameroon</option>
                          <option>United States</option>
                        </select>
                      </label>
                    </div>
                  } @else if (selectedPaymentMethod() === 'paypal') {
                    <div class="payment-method-note">
                      <p>{{ language.t('paymentNotePaypal') }}</p>
                    </div>
                  } @else if (selectedPaymentMethod() === 'googlepay') {
                    <div class="payment-method-note">
                      <p>{{ language.t('paymentNoteGooglePay') }}</p>
                    </div>
                  }

                  <button type="button" class="btn-outline payment-confirm-btn" (click)="confirmPaymentMode()">
                    {{ language.t('next') }}
                  </button>
                </section>
              }

              <div class="price-breakdown">
                <div class="line-item">
                  <span>{{ stay.price_per_night | currency:'XAF' }} x {{ calculateNights() }} {{ calculateNights() > 1 ? language.t('night') + 's' : language.t('night') }}</span>
                  <span>{{ calculateTotal() | currency:'XAF' }}</span>
                </div>
                <div class="line-item">
                  <span>{{ language.t('cleaningFee') }}</span>
                  <span>{{ stay.cleaning_fee | currency:'XAF' }}</span>
                </div>
                <div class="line-item">
                  <span>{{ language.t('serviceFee') }}</span>
                  <span>{{ (calculateTotal() * 0.14) | currency:'XAF' }}</span>
                </div>
                <hr />
                <div class="total-item">
                  <span>{{ language.t('total') }}</span>
                  <span>{{ (calculateTotal() + Number(stay.cleaning_fee || 0) + (calculateTotal() * 0.14)) | currency:'XAF' }}</span>
                </div>
              </div>
            </div>

            <div class="report-listing">
              <button>
                <span class="material-symbols-outlined">flag</span>
                {{ language.t('reportListing') }}
              </button>
            </div>
          </aside>
        </div>
      </main>
    } @else {
      <div class="loading-state">
        <div class="spinner"></div>
        <p>{{ language.t('findingDreamStay') }}</p>
      </div>
    }

    @if (message()) {
      <div class="toast-notification" [class.show]="message()">
        <span class="material-symbols-outlined">info</span>
        {{ message() }}
      </div>
    }
  `,
  styles: [`
    :host {
      --primary: #ba0036;
      --primary-dark: #a0002e;
      --text-main: #1b1c1c;
      --text-muted: #5c3f41;
      --border: #e5bdbe;
      --bg-light: #fcf9f8;
      --white: #ffffff;
      --shadow: 0 12px 32px rgba(27, 28, 28, 0.1);
    }

    .property-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }

    .detail-header {
      margin-bottom: 24px;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .back-link {
      display: flex;
      align-items: center; gap: 8px; color: var(--text-main); text-decoration: none; font-weight: 700; font-size: 0.9rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .action-btn {
      display: flex; align-items: center; gap: 8px; background: transparent; border: 0; padding: 8px 12px; border-radius: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer; color: var(--text-main); transition: background 0.2s;
    }

    .action-btn:hover { background: #f0eded; }
    .action-btn .material-symbols-outlined { font-size: 20px; }

    .detail-header h1 {
      font-size: 2.5rem; font-weight: 900; margin-bottom: 8px; letter-spacing: -0.02em;
    }

    .header-meta {
      display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.95rem;
    }

    .rating { display: flex; align-items: center; gap: 4px; }
    .rating .material-symbols-outlined { color: #ffb800; font-variation-settings: 'FILL' 1; }
    .separator { color: #ccc; }
    address { font-style: normal; text-decoration: underline; }

    .image-gallery { margin-bottom: 48px; border-radius: 16px; overflow: hidden; }

    .gallery-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; height: 500px; }

    .main-image { overflow: hidden; }
    .main-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .main-image:hover img { transform: scale(1.05); }

    .side-images { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    .side-images img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .side-images img:hover { transform: scale(1.05); }

    .content-layout { display: grid; grid-template-columns: 1fr 380px; gap: 80px; }

    .host-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }

    .host-info h2 { font-size: 1.4rem; font-weight: 800; margin-bottom: 4px; }
    .host-info p { color: var(--text-muted); margin: 0; }
    .host-avatar .material-symbols-outlined { font-size: 56px; color: #ccc; }

    .divider { border: 0; border-top: 1px solid #eee; margin: 32px 0; }

    .highlights { display: grid; gap: 24px; }
    .highlight-item { display: flex; gap: 20px; }
    .highlight-item .material-symbols-outlined { font-size: 32px; color: var(--text-muted); }
    .highlight-item strong { display: block; margin-bottom: 4px; font-size: 1.05rem; }
    .highlight-item p { color: var(--text-muted); margin: 0; font-size: 0.95rem; line-height: 1.5; }

    .description h3 { font-size: 1.4rem; font-weight: 800; margin-bottom: 16px; }
    .description p { line-height: 1.7; color: var(--text-main); margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .description p.expanded { -webkit-line-clamp: unset; display: block; overflow: visible; }
    .show-more { background: transparent; border: 0; color: var(--text-main); font-weight: 800; text-decoration: underline; display: flex; align-items: center; cursor: pointer; }

    .rating-input { display: flex; gap: 4px; margin-bottom: 16px; }
    .rating-input button { background: transparent; border: 0; padding: 0; cursor: pointer; transition: transform 0.2s; }
    .rating-input button:hover { transform: scale(1.2); }
    .rating-input .material-symbols-outlined { color: #ccc; font-size: 32px; transition: color 0.2s; }
    .rating-input .material-symbols-outlined.filled { color: #ffb800; font-variation-settings: 'FILL' 1; }

    .amenities h3 { font-size: 1.4rem; font-weight: 800; margin-bottom: 24px; }
    .amenity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .amenity-item { display: flex; align-items: center; gap: 16px; font-size: 1.05rem; }
    .amenity-item .material-symbols-outlined { font-size: 24px; color: var(--text-muted); }

    .btn-post-review {
      margin-top: 12px;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 14px 32px;
      background: #1b1c1c;
      color: #fff !important;
      border: 0;
      border-radius: 14px;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-post-review:hover:not(:disabled) {
      background: var(--primary);
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 24px rgba(186, 0, 54, 0.2);
    }

    .btn-post-review:disabled {
      background: #e6e2dc;
      color: #888 !important;
      cursor: not-allowed;
      opacity: 0.8;
    }

    .btn-post-review .material-symbols-outlined {
      font-size: 20px;
      transition: transform 0.3s ease;
    }

    .btn-post-review:hover .material-symbols-outlined {
      transform: translateX(4px) rotate(-15deg);
    }

    .btn-outline { background: var(--white); border: 1px solid var(--text-main); padding: 12px 24px; border-radius: 10px; font-weight: 800; cursor: pointer; transition: background 0.2s; }
    .btn-outline:hover { background: var(--bg-light); }

    .booking-card { position: sticky; top: 100px; background: var(--white); border: 1px solid var(--border); border-radius: 24px; padding: 24px; box-shadow: var(--shadow); }

    .price-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .price-header .amount { font-size: 1.6rem; font-weight: 900; }
    .price-header .unit { color: var(--text-muted); font-weight: 600; margin-left: 4px; }
    .rating-summary { display: flex; align-items: center; gap: 4px; font-size: 0.9rem; }
    .rating-summary .material-symbols-outlined { color: #ffb800; font-variation-settings: 'FILL' 1; font-size: 16px; }

    .booking-form { display: grid; gap: 16px; margin-bottom: 24px; }
    .date-inputs { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #ccc; border-radius: 12px; overflow: hidden; }
    .date-inputs label { padding: 10px 12px; border-right: 1px solid #ccc; display: flex; flex-direction: column; gap: 4px; }
    .date-inputs label:last-child { border-right: 0; }
    .date-inputs label span { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    .date-inputs input { border: 0; padding: 0; font-size: 0.9rem; width: 100%; }
    .guest-input { border: 1px solid #ccc; border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
    .guest-input span { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    .guest-input input { border: 0; padding: 0; font-size: 0.9rem; width: 100%; }

    .book-btn { background: var(--primary); color: var(--white) !important; border: 0; border-radius: 12px; padding: 16px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: background 0.2s; }
    .book-btn:hover { background: var(--primary-dark); }
    .charge-notice { text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-top: 12px; }

    .payment-control { display: grid; gap: 10px; margin: 24px 0 16px; }
    .payment-toggle { display: inline-flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 14px; border: 1px solid var(--border); background: #fff; color: var(--text-main); font-weight: 800; cursor: pointer; }
    .payment-toggle .material-symbols-outlined { font-size: 18px; }
    .payment-hint { color: var(--text-muted); font-size: 0.9rem; margin: 0; }

    .payment-panel { background: #fbf6f5; border: 1px solid #f0d0d2; border-radius: 20px; padding: 20px; display: grid; gap: 18px; }
    .payment-panel-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
    .payment-panel-header strong { display: block; font-size: 1rem; margin-bottom: 6px; }
    .payment-panel-header p { color: var(--text-muted); margin: 0; }
    .btn-plain { background: transparent; border: 0; color: var(--text-main); font-weight: 700; cursor: pointer; }

    .payment-method-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .payment-method-grid button { background: #fff; border: 1px solid #ddd; border-radius: 14px; padding: 14px 12px; cursor: pointer; font-weight: 700; transition: border-color 0.2s, transform 0.2s; }
    .payment-method-grid button:hover { transform: translateY(-1px); }
    .payment-method-grid button.active { border-color: var(--primary); color: var(--primary); }

    .payment-card-fields { display: grid; gap: 14px; }
    .payment-card-fields label { display: grid; gap: 8px; font-weight: 700; color: var(--text-main); }
    .payment-card-fields input,
    .payment-card-fields select { border: 1px solid #ccc; border-radius: 12px; padding: 12px 14px; font-size: 0.95rem; width: 100%; }
    .payment-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .payment-method-note { padding: 16px; background: #fff; border: 1px solid #e5dde0; border-radius: 16px; color: var(--text-muted); }
    .payment-confirm-btn { justify-self: start; }

    .price-breakdown { display: grid; gap: 12px; }
    .line-item { display: flex; justify-content: space-between; color: var(--text-main); font-size: 0.95rem; }
    .total-item { display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem; }

    .report-listing { margin-top: 24px; text-align: center; }
    .report-listing button { background: transparent; border: 0; display: flex; align-items: center; gap: 8px; margin: 0 auto; color: #888; font-weight: 600; cursor: pointer; }

    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; }
    .spinner { width: 50px; height: 50px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s infinite linear; margin-bottom: 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .toast-notification { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(100px); background: #1b1c1c; color: var(--white); padding: 16px 24px; border-radius: 16px; display: flex; align-items: center; gap: 12px; font-weight: 700; transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); z-index: 2000; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .toast-notification.show { transform: translateX(-50%) translateY(0); }

    @media (max-width: 968px) {
      .content-layout { grid-template-columns: 1fr; gap: 48px; }
      .sidebar-content { order: -1; }
      .gallery-grid { height: 300px; }
      .detail-header h1 { font-size: 1.8rem; }
    }
  `]
})
export class PropertyDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);
  private readonly propertiesApi = inject(PropertyService);
  private readonly bookingsApi = inject(BookingService);
  private readonly router = inject(Router);
  private readonly reviewsApi = inject(ReviewService);
  private readonly wishlistApi = inject(WishlistService);

  protected readonly property = signal<Property | null>(null);
  protected readonly reviews = signal<Review[]>([]);
  protected readonly message = signal('');
  protected readonly showFullDescription = signal(false);
  protected readonly showAllAmenities = signal(false);
  protected readonly isSubmittingReview = signal(false);
  protected readonly isSubmittingBooking = signal(false);
  protected readonly isAddingWishlist = signal(false);
  protected readonly showPaymentOptions = signal(false);
  protected readonly selectedPaymentMethod = signal('card');
  protected readonly paymentConfirmed = signal(false);
  protected readonly language = inject(LanguageService);
  protected readonly Number = Number;

  private readonly fallbackImages = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85'
  ];

  protected readonly bookingForm = this.fb.nonNullable.group({
    check_in: ['', Validators.required],
    check_out: ['', Validators.required],
    guests: [1, [Validators.required, Validators.min(1)]]
  });

  protected readonly reviewForm = this.fb.nonNullable.group({
    rating: [5, Validators.required],
    comment: ['', Validators.required]
  });

  protected readonly paymentForm = this.fb.group({
    method: ['card'],
    cardholder: [''],
    cardNumber: [''],
    expiry: [''],
    cvc: [''],
    postalCode: [''],
    country: ['France']
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.propertiesApi.detail(id).subscribe((property) => {
      this.property.set(property);
      this.bookingForm.patchValue({ guests: 1 });
    });
    this.loadReviews(id);
  }

  protected togglePaymentOptions(): void {
    this.showPaymentOptions.set(!this.showPaymentOptions());
  }

  protected selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod.set(method);
    this.paymentForm.patchValue({ method });
  }

  protected paymentLabel(method: string): string {
    switch (method) {
      case 'paypal': return 'PayPal';
      case 'googlepay': return 'Google Pay';
      case 'card':
      default:
        return 'Carte de crédit ou de débit';
    }
  }

  protected confirmPaymentMode(): void {
    this.paymentConfirmed.set(true);
    this.showPaymentOptions.set(false);
    this.flash(this.language.t('paymentModeSelected'));
  }

  calculateNights(): number {
    const { check_in, check_out } = this.bookingForm.value;
    if (!check_in || !check_out) return 0;
    const start = new Date(check_in);
    const end = new Date(check_out);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  calculateTotal(): number {
    const nights = this.calculateNights();
    const price = Number(this.property()?.price_per_night || 0);
    return nights * price;
  }

  book(property: number): void {
    if (!this.auth.isLoggedIn()) {
      this.flash(this.language.t('loginToReserve'));
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (this.bookingForm.invalid) {
      this.flash(this.language.t('fillDetailsCorrectly'));
      return;
    }

    const nights = this.calculateNights();
    if (nights <= 0) {
      this.flash(this.language.t('checkOutAfterCheckIn'));
      return;
    }

    this.isSubmittingBooking.set(true);
    this.bookingsApi.create({ property, ...this.bookingForm.getRawValue() }).subscribe({
      next: (booking) => {
        this.isSubmittingBooking.set(false);
        this.flash(this.language.t('bookingSuccessful'));
        setTimeout(() => this.router.navigate(['/booking-confirmation', booking.id]), 1500);
      },
      error: (err) => {
        this.isSubmittingBooking.set(false);
        const msg = err.error?.non_field_errors?.[0] || this.language.t('couldNotBook');
        this.flash(msg);
      }
    });
  }

  review(property: number): void {
    if (!this.auth.isLoggedIn()) {
      this.flash(this.language.t('loginToReview'));
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (this.reviewForm.invalid) return;
    this.isSubmittingReview.set(true);
    this.reviewsApi.create({ property, ...this.reviewForm.getRawValue() }).subscribe({
      next: () => {
        this.isSubmittingReview.set(false);
        this.reviewForm.patchValue({ comment: '', rating: 5 });
        this.loadReviews(property);
        this.flash(this.language.t('thankYouReview'));
      },
      error: (err) => {
        this.isSubmittingReview.set(false);
        if (err.status === 400 && err.error?.non_field_errors?.[0]?.includes('unique')) {
          this.flash(this.language.t('alreadyReviewed'));
        } else {
          this.flash(this.language.t('couldNotPostReview'));
        }
      }
    });
  }

  addWishlist(property: number): void {
    if (this.isAddingWishlist()) return;
    this.isAddingWishlist.set(true);
    this.wishlistApi.add(property).subscribe({
      next: () => {
        this.isAddingWishlist.set(false);
        this.flash(this.language.t('addedWishlist'));
      },
      error: (err) => {
        this.isAddingWishlist.set(false);
        if (err.status === 400) {
          this.flash(this.language.t('alreadyWishlist'));
        } else {
          this.flash(this.language.t('couldNotSave'));
        }
      }
    });
  }

  share(): void {
    this.flash(this.language.t('linkCopied'));
  }

  fallbackImage(index: number): string {
    return this.fallbackImages[index % this.fallbackImages.length];
  }

  private loadReviews(property: number): void {
    this.reviewsApi.list(property).subscribe((page) => this.reviews.set(page.results));
  }

  private flash(text: string): void {
    this.message.set(text);
    window.setTimeout(() => this.message.set(''), 3000);
  }
}
