import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../core/property.service';
import { Property } from '../../core/models';
import { LanguageService } from '../../core/language.service';
import { AuthService } from '../../core/auth.service'; // Added for admin status checks

type FilterMap = Partial<Record<'city' | 'country' | 'guests' | 'property_type' | 'min_price' | 'ordering', string>>;

interface LandingCategory {
  label: string;
  translationKey: string;
  icon: string;
  filters: FilterMap;
}

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, RouterLink],
  template: `
    <!-- ADMIN ALERT BAR: Appears only if logged user is an administrator/staff member -->
    @if (authService.currentUser()?.is_staff || authService.currentUser()?.is_superuser) {
      <div class="admin-control-strip">
        <div class="admin-strip-content">
          <span class="material-symbols-outlined">shield_person</span>
          <p><strong>Admin Dashboard Active:</strong> Signed in as {{ authService.currentUser()?.username }}. You have full control over stays and properties.</p>
        </div>
        <a routerLink="/admin" class="admin-action-btn">Manage System</a>
      </div>
    }

    <header class="stay-hero">
      <div class="stay-hero-media">
        <!-- Relaxed optimized developer layout image links -->
        <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80" alt="Modern luxury villa with infinity pool at sunset" />
      </div>
      <div class="stay-hero-content">
        <h1>{{ language.t('findNextStay') }} <span class="highlight">{{ language.t('unforgettable') }}</span></h1>
        <p>{{ language.t('discoverUnique') }}</p>
        
        <form class="stay-search" [formGroup]="filters" (ngSubmit)="load()">
          <div class="search-input-group">
            <label>
              <span>{{ language.t('location') }}</span>
              <input formControlName="city" [placeholder]="language.t('whereGoing')" />
            </label>
            <label>
              <span>{{ language.t('country') }}</span>
              <input formControlName="country" [placeholder]="language.t('addCountry')" />
            </label>
            <label>
              <span>{{ language.t('guests') }}</span>
              <input formControlName="guests" type="number" min="1" [placeholder]="language.t('addGuests')" />
            </label>
          </div>
          <button type="submit" aria-label="Search" class="search-btn">
            <span class="material-symbols-outlined">search</span>
            <span>{{ language.t('search') }}</span>
          </button>
        </form>
      </div>
    </header>

    <section class="category-bar" aria-label="Property categories">
      <div class="category-strip">
        @for (category of categories; track category.label) {
          <button
            type="button"
            [class.active]="activeCategory() === category.label"
            (click)="selectCategory(category)"
          >
            <span class="material-symbols-outlined">{{ category.icon }}</span>
            <span class="label">{{ language.t(category.translationKey) }}</span>
          </button>
        }
      </div>
    </section>

    <main class="page-container">
      <section class="stays-section">
        <div class="section-head">
          <div>
            <span class="eyebrow">{{ language.t('explore') }}</span>
            <h2>{{ language.t(activeCategoryTranslationKey()) }}</h2>
          </div>
          <div class="section-actions">
            @if (loading()) {
              <div class="loader-dots"><span></span><span></span><span></span></div>
            }
          </div>
        </div>

        @if (error()) {
          <div class="error-notice">
            <span class="material-symbols-outlined">error</span>
            <p>{{ error() }}</p>
          </div>
        }

        <div class="stay-grid">
          @for (property of visibleProperties(); track property.id; let i = $index) {
            <a class="stay-card" [routerLink]="['/properties', property.id]">
              <div class="stay-photo-container">
                <div class="stay-photo">
                  @if (property.images && property.images.length) {
                    <img [src]="property.images[0].image" [alt]="property.title" loading="lazy" />
                  } @else {
                    <img [src]="fallbackImage(property, i)" [alt]="property.title" loading="lazy" />
                  }
                </div>
                <button type="button" class="favorite-btn" (click)="$event.preventDefault(); toggleFavorite(property.id)">
                  <span class="material-symbols-outlined">favorite</span>
                </button>
                <div class="property-tag">{{ property.property_type }}</div>
              </div>
              <div class="stay-card-body">
                <div class="card-title-row">
                  <h3>{{ property.title }}</h3>
                  <div class="rating">
                    <span class="material-symbols-outlined">star</span>
                    <span>{{ property.average_rating || language.t('new') }}</span>
                  </div>
                </div>
                <p class="location">{{ property.city }}, {{ property.country }}</p>
                <p class="amenity-summary">{{ property.max_guests }} guests &middot; {{ property.bedrooms }} bedrooms &middot; {{ property.beds }} beds</p>
                <div class="price-row">
                  <span class="price">{{ property.price_per_night | currency:'XAF':'symbol':'1.0-0' }}</span>
                  <span class="unit">/ {{ language.t('night') }}</span>
                </div>
              </div>
            </a>
          } @empty {
            @if (!loading()) {
              <div class="empty-state">
                <span class="material-symbols-outlined">search_off</span>
                <h3>{{ language.t('noPropertiesFound') }}</h3>
                <p>{{ language.t('tryAdjustingFilters') }}</p>
                <button type="button" (click)="resetFilters()">{{ language.t('clearAllFilters') }}</button>
              </div>
            }
          }
        </div>
      </section>

      <!-- Fixed: Modified to standard inline image handling to circumvent CSS Background CORS blocking -->
      <section class="feature-banner" aria-label="Stay of the week">
        <div class="banner-image-bg">
          <img src="https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=1200&q=80" alt="Highland Castle Background" />
        </div>
        <div class="banner-content">
          <span class="tag">{{ language.t('stayOfWeek') }}</span>
          <h2>Highland Heritage Castle</h2>
          <p>Experience a night of royalty in a restored stronghold where luxury meets history in every stone. A truly unique escape for those seeking something extraordinary.</p>
          <button type="button" (click)="exploreCastle()">
            {{ language.t('viewDetails') }} 
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </section>

      <section class="host-invitation">
        <div class="invitation-text">
          <h2>{{ language.t('becomeHost') }}</h2>
          <p>{{ language.t('shareHome') }}</p>
          <a routerLink="/host" class="btn-primary">{{ language.t('getStarted') }}</a>
        </div>
        <div class="invitation-visual">
          <div class="image-wrapper">
            <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80" alt="Hosts preparing a welcoming kitchen" />
            <div class="testimonial-card">
              <span class="quote">"</span>
              <p>{{ language.t('hostingChangedLife') }}</p>
              <strong>Oceanne and Lauren, Superhosts</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host {
      --primary: #ba0036;
      --primary-dark: #a0002e;
      --text-main: #1b1c1c;
      --text-muted: #5c3f41;
      --bg-main: #fcf9f8;
      --white: #ffffff;
      --shadow: 0 12px 32px rgba(27, 28, 28, 0.08);
      --radius: 20px;
    }

    /* Clean Admin Header Banner Styles */
    .admin-control-strip {
      background: #111827;
      color: #f3f4f6;
      padding: 12px 5vw;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      font-size: 0.9rem;
    }

    .admin-strip-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .admin-strip-content .material-symbols-outlined {
      color: #fbbf24;
    }

    .admin-action-btn {
      background: #fbbf24;
      color: #111827 !important;
      padding: 6px 16px;
      border-radius: 8px;
      font-weight: 700;
      text-decoration: none;
      transition: opacity 0.2s;
    }

    .admin-action-btn:hover {
      opacity: 0.9;
    }

    .stay-hero {
      position: relative;
      height: 80vh;
      min-height: 600px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      overflow: hidden;
    }

    .stay-hero-media {
      position: absolute;
      inset: 0;
      z-index: -1;
    }

    .stay-hero-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .stay-hero-media::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.5));
    }

    .stay-hero-content {
      position: relative;
      z-index: 1;
      text-align: center;
      color: var(--white);
      max-width: 900px;
      width: 100%;
    }

    .stay-hero-content h1 {
      font-size: clamp(2.5rem, 8vw, 5rem);
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }

    .stay-hero-content h1 .highlight {
      color: #ffdae1;
      font-style: italic;
    }

    .stay-hero-content p {
      font-size: clamp(1.1rem, 2vw, 1.4rem);
      font-weight: 500;
      margin-bottom: 48px;
      opacity: 0.95;
    }

    .stay-search {
      background: var(--white);
      border-radius: 999px;
      padding: 10px;
      display: flex;
      align-items: center;
      box-shadow: 0 24px 48px rgba(0,0,0,0.25);
      margin: 0 auto;
      max-width: 860px;
    }

    .search-input-group {
      display: flex;
      flex: 1;
      padding: 0 20px;
    }

    .stay-search label {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      padding: 12px 24px;
      border-right: 1px solid #eee;
      text-align: left;
    }

    .stay-search label:last-child {
      border-right: 0;
    }

    .stay-search label span {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stay-search input {
      border: 0;
      background: transparent;
      padding: 0;
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-main);
      width: 100%;
    }

    .stay-search input::placeholder {
      color: #999;
    }

    .search-btn {
      background: var(--primary);
      color: var(--white) !important;
      border: 0;
      border-radius: 999px;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .search-btn:hover {
      background: var(--primary-dark);
      transform: scale(1.02);
    }

    .category-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(252, 249, 248, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #e5e2e1;
      padding: 12px 0;
    }

    .category-strip {
      display: flex;
      gap: 32px;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 5vw;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .category-strip::-webkit-scrollbar { display: none; }

    .category-strip button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: 0;
      padding: 8px 0;
      color: var(--text-muted);
      cursor: pointer;
      min-width: max-content;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .category-strip button:hover {
      opacity: 1;
      color: var(--text-main);
    }

    .category-strip button.active {
      opacity: 1;
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    .category-strip .material-symbols-outlined {
      font-size: 26px;
    }

    .category-strip .label {
      font-size: 0.8rem;
      font-weight: 700;
    }

    .page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 48px 5vw;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
    }

    .section-head h2 {
      font-size: 2.2rem;
      font-weight: 800;
      margin: 0;
    }

    .stay-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 32px;
    }

    .stay-card {
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.3s ease;
    }

    .stay-photo-container {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .stay-photo {
      width: 100%;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.33, 1, 0.68, 1);
    }

    .stay-card:hover .stay-photo {
      transform: scale(1.08);
    }

    .stay-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .favorite-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: transparent;
      border: 0;
      color: var(--white);
      cursor: pointer;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      transition: all 0.2s ease;
    }

    .favorite-btn:hover {
      transform: scale(1.2);
    }

    .property-tag {
      position: absolute;
      bottom: 16px;
      left: 16px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      padding: 6px 14px;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--text-main);
      text-transform: uppercase;
    }

    .stay-card-body h3 {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
    }

    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 700;
      font-size: 0.95rem;
    }

    .rating .material-symbols-outlined {
      font-size: 18px;
      color: #ffb800;
      font-variation-settings: 'FILL' 1;
    }

    .location {
      color: var(--text-muted);
      margin: 0;
      font-size: 0.95rem;
    }

    .amenity-summary {
      color: #888;
      font-size: 0.85rem;
      margin: 4px 0 12px;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .price {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--primary);
    }

    .unit {
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .feature-banner {
      margin: 80px 0;
      height: 500px;
      border-radius: 32px;
      display: flex;
      align-items: center;
      padding: 0 80px;
      color: var(--white);
      position: relative;
      overflow: hidden;
    }

    .banner-image-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .banner-image-bg img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .banner-image-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.45);
    }

    .banner-content {
      max-width: 600px;
      position: relative;
      z-index: 1;
    }

    .banner-content .tag {
      display: inline-block;
      padding: 6px 16px;
      background: var(--white);
      color: var(--primary);
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .banner-content h2 {
      font-size: 3.5rem;
      font-weight: 900;
      margin-bottom: 16px;
      line-height: 1;
    }

    .banner-content p {
      font-size: 1.1rem;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .banner-content button {
      padding: 16px 32px;
      border-radius: 14px;
      background: var(--white);
      color: var(--text-main) !important;
      font-weight: 800;
      border: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .banner-content button:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }

    .host-invitation {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
      background: #f6f3f2;
      border-radius: 32px;
      padding: 80px;
    }

    .invitation-text h2 {
      font-size: 3rem;
      font-weight: 900;
      margin-bottom: 24px;
      line-height: 1.1;
    }

    .invitation-text p {
      font-size: 1.2rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 40px;
    }

    .btn-primary {
      display: inline-block;
      padding: 18px 40px;
      background: var(--primary);
      color: var(--white) !important;
      border-radius: 16px;
      font-weight: 800;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(186, 0, 54, 0.2);
    }

    .image-wrapper {
      position: relative;
      transform: rotate(2deg);
    }

    .invitation-visual img {
      width: 100%;
      border-radius: 24px;
      box-shadow: 0 24px 48px rgba(0,0,0,0.15);
    }

    .testimonial-card {
      position: absolute;
      bottom: -30px;
      left: -40px;
      background: var(--white);
      padding: 24px;
      border-radius: 20px;
      box-shadow: 0 16px 32px rgba(0,0,0,0.1);
      max-width: 320px;
    }

    .testimonial-card .quote {
      font-size: 4rem;
      color: var(--primary);
      line-height: 0;
      display: block;
      margin-top: 20px;
      opacity: 0.2;
    }

    .testimonial-card p {
      font-size: 1rem;
      font-style: italic;
      margin: 10px 0;
    }

    .loader-dots {
      display: flex;
      gap: 6px;
    }

    .loader-dots span {
      width: 8px;
      height: 8px;
      background: var(--primary);
      border-radius: 50%;
      animation: bounce 0.6s infinite alternate;
    }

    .loader-dots span:nth-child(2) { animation-delay: 0.2s; }
    .loader-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce { to { transform: translateY(-8px); opacity: 0.3; } }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 80px 0;
    }

    .empty-state .material-symbols-outlined {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state button {
      margin-top: 24px;
      background: transparent;
      border: 1px solid var(--primary);
      color: var(--primary);
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    @media (max-width: 1024px) {
      .host-invitation {
        grid-template-columns: 1fr;
        padding: 40px;
        gap: 40px;
      }
      .testimonial-card {
        left: 0;
        bottom: 10px;
      }
      .stay-search {
        flex-direction: column;
        border-radius: 24px;
        padding: 16px;
      }
      .search-input-group {
        flex-direction: column;
        width: 100%;
        padding: 0;
      }
      .stay-search label {
        border-right: 0;
        border-bottom: 1px solid #eee;
      }
      .search-btn {
        width: 100%;
        margin-top: 16px;
        justify-content: center;
      }
      .feature-banner {
        height: auto;
        padding: 60px 40px;
      }
      .banner-content h2 { font-size: 2.5rem; }
    }

    @media (max-width: 768px) {
      .stay-hero { height: auto; min-height: 500px; }
      .stay-hero-content h1 { font-size: 2.8rem; }
      .stay-grid { grid-template-columns: 1fr; }
      .invitation-text h2 { font-size: 2.2rem; }
      .category-strip { gap: 20px; }
    }
  `]
})
export class HomePage {
  private readonly fb = inject(FormBuilder);
  private readonly propertiesApi = inject(PropertyService);
  protected readonly language = inject(LanguageService);
  protected readonly authService = inject(AuthService); // Injected Authentication

  protected readonly properties = signal<Property[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly activeCategory = signal('Amazing pools');
  protected readonly activeCategoryTranslationKey = computed(() => {
    return this.categories.find(c => c.label === this.activeCategory())?.translationKey || 'explore';
  });
  protected readonly visibleProperties = computed(() => this.properties());

  protected readonly categories: LandingCategory[] = [
    { label: 'Amazing pools', translationKey: 'amazingPools', icon: 'pool', filters: {} },
    { label: 'Beachfront', translationKey: 'beachfront', icon: 'beach_access', filters: { country: 'Greece' } },
    { label: 'Cabins', translationKey: 'cabins', icon: 'cabin', filters: { property_type: 'cabin' } },
    { label: 'Luxe', translationKey: 'luxe', icon: 'diamond', filters: { min_price: '300' } },
    { label: 'Trending', translationKey: 'trending', icon: 'trending_up', filters: { ordering: '-created_at' } },
    { label: 'Countryside', translationKey: 'countryside', icon: 'landscape', filters: { property_type: 'house' } },
    { label: 'Castles', translationKey: 'castles', icon: 'castle', filters: { property_type: 'villa' } },
    { label: 'Top cities', translationKey: 'topCities', icon: 'apartment', filters: { property_type: 'apartment' } }
  ];

  protected readonly filters = this.fb.nonNullable.group({
    city: [''],
    country: [''],
    guests: [''],
    property_type: [''],
    min_price: [''],
    ordering: ['']
  });

  // Updated: High-quality curated premium photography array for real-estate fallbacks
  private readonly fallbackImages = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80', // Apartment
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80', // House
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80', // Villa
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80', // Cabin
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=80'  // Room
  ];

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.propertiesApi.list(this.filters.getRawValue()).subscribe({
      next: (page) => this.properties.set(page.results),
      error: (err) => {
        console.error(err);
        this.error.set('Could not load properties. Make sure the database connectivity is active.');
      },
      complete: () => this.loading.set(false)
    });
  }

  selectCategory(category: LandingCategory): void {
    this.activeCategory.set(category.label);
    this.applyFilters(category.filters);
  }

  resetFilters(): void {
    this.filters.reset();
    this.activeCategory.set('Amazing pools');
    this.load();
  }

  exploreCastle(): void {
    this.activeCategory.set('Castles');
    this.applyFilters({ property_type: 'villa', min_price: '300' });
  }

  toggleFavorite(id: number): void {
    console.log('Toggled favorite for property:', id);
  }

  fallbackImage(property: Property, index: number): string {
    const typeMap: Record<string, string> = {
      apartment: this.fallbackImages[0],
      house: this.fallbackImages[1],
      villa: this.fallbackImages[2],
      cabin: this.fallbackImages[3],
      room: this.fallbackImages[4]
    };
    return typeMap[property.property_type] ?? this.fallbackImages[index % this.fallbackImages.length];
  }

  private applyFilters(filters: FilterMap): void {
    this.filters.patchValue({
      city: filters['city'] ?? '',
      country: filters['country'] ?? '',
      guests: filters['guests'] ?? '',
      property_type: filters['property_type'] ?? '',
      min_price: filters['min_price'] ?? '',
      ordering: filters['ordering'] ?? ''
    });
    this.load();
    document.querySelector('.stays-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}