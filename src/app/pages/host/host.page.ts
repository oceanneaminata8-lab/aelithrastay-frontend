import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Property } from '../../core/models';
import { PropertyService } from '../../core/property.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-host-page',
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule],
  template: `
    <main class="host-studio">
      <header class="studio-header">
        <div class="header-content">
          <div>
            <span class="studio-badge">{{ language.t('hostStudio') }}</span>
            <h1>{{ language.t('manageEmpire').split(' ')[0] }} {{ language.t('manageEmpire').split(' ')[1] }} <span class="highlight">{{ language.t('manageEmpire').split(' ')[2] }}</span></h1>
            <p>{{ language.t('manageEmpireDesc') }}</p>
          </div>
          <div class="studio-stats">
            <div class="stat-pill">
              <strong>{{ properties().length }}</strong>
              <span>{{ language.t('activeListings') }}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="studio-layout">
        <section class="listing-creator">
          <div class="card-glass">
            <div class="card-header">
              <span class="material-symbols-outlined icon-bg">add_home</span>
              <div>
                <h2>{{ language.t('createNewListing') }}</h2>
                <p>{{ language.t('provideDetails') }}</p>
              </div>
            </div>

            <form [formGroup]="form" (ngSubmit)="create()" class="modern-form">
              <div class="form-section">
                <h3>{{ language.t('basicInformation') }}</h3>
                <label class="floating-label">
                  <span>{{ language.t('listingTitle') }}</span>
                  <input formControlName="title" [placeholder]="language.t('listingTitlePlaceholder')" />
                </label>
                <label class="floating-label">
                  <span>{{ language.t('bio') }}</span>
                  <textarea formControlName="description" [placeholder]="language.t('descriptionPlaceholder')"></textarea>
                </label>
              </div>

              <div class="form-grid">
                <label class="floating-label">
                  <span>{{ language.t('propertyType') }}</span>
                  <select formControlName="property_type">
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="cabin">Cabin</option>
                    <option value="room">Room</option>
                    <option value="hotel">Hotel</option>
                  </select>
                </label>
                <label class="floating-label">
                  <span>{{ language.t('pricePerNight') }}</span>
                  <div class="input-with-prefix">
                    <span class="prefix">FCFA</span>
                    <input formControlName="price_per_night" type="number" min="1" />
                  </div>
                </label>
              </div>

              <div class="form-section">
                <h3>{{ language.t('location') }}</h3>
                <label class="floating-label">
                  <span>{{ language.t('address') }}</span>
                  <input formControlName="address" [placeholder]="language.t('addressPlaceholder')" />
                </label>
                <div class="form-grid">
                  <label class="floating-label">
                    <span>{{ language.t('city') }}</span>
                    <input formControlName="city" [placeholder]="language.t('cityPlaceholder')" />
                  </label>
                  <label class="floating-label">
                    <span>{{ language.t('country') }}</span>
                    <input formControlName="country" [placeholder]="language.t('countryPlaceholder')" />
                  </label>
                </div>
              </div>

              <div class="form-section">
                <h3>{{ language.t('layoutCapacity') }}</h3>
                <div class="form-row-multi">
                  <label class="counter-input">
                    <span>{{ language.t('guests') }}</span>
                    <input formControlName="max_guests" type="number" min="1" />
                  </label>
                  <label class="counter-input">
                    <span>{{ language.t('bedrooms') }}</span>
                    <input formControlName="bedrooms" type="number" min="1" />
                  </label>
                  <label class="counter-input">
                    <span>{{ language.t('beds') }}</span>
                    <input formControlName="beds" type="number" min="1" />
                  </label>
                  <label class="counter-input">
                    <span>{{ language.t('baths') }}</span>
                    <input formControlName="bathrooms" type="number" min="1" step="0.5" />
                  </label>
                </div>
              </div>

              @if (error()) {
                <div class="form-error">
                  <span class="material-symbols-outlined">error</span>
                  {{ error() }}
                </div>
              }

              <button type="submit" class="submit-btn" [disabled]="form.invalid || isSubmitting()">
                <span>{{ isSubmitting() ? language.t('publishing') : language.t('publishListing') }}</span>
                <span class="material-symbols-outlined">{{ isSubmitting() ? 'hourglass_top' : 'rocket_launch' }}</span>
              </button>
            </form>
          </div>
        </section>

        <aside class="my-inventory">
          <div class="inventory-header">
            <h3>{{ language.t('myProperties') }}</h3>
            <span class="count-chip">{{ properties().length }} total</span>
          </div>

          <div class="inventory-stack">
            @for (item of properties(); track item.id; let i = $index) {
              <article class="property-studio-card">
                <div class="card-visual">
                  <img [src]="fallbackImage(item, i)" [alt]="item.title" />
                  <div class="status-indicator">Active</div>
                </div>
                <div class="card-info">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.city }}, {{ item.country }}</p>
                  <div class="card-footer">
                    <strong>{{ item.price_per_night | currency:'XAF':'symbol':'1.0-0' }} <small>/ {{ language.t('night') }}</small></strong>
                    <button type="button" class="icon-btn-delete" (click)="deleteProperty(item.id)" title="Remove Listing">
                      <span class="material-symbols-outlined">delete_sweep</span>
                    </button>
                  </div>
                </div>
              </article>
            } @empty {
              <div class="empty-inventory">
                <span class="material-symbols-outlined">maps_home_work</span>
                <p>{{ language.t('noPropertiesListed') }}</p>
                <small>{{ language.t('startByFillingForm') }}</small>
              </div>
            }
          </div>
        </aside>
      </div>

      @if (notice()) {
        <div class="toast-studio show">
          <span class="material-symbols-outlined">check_circle</span>
          {{ notice() }}
        </div>
      }
    </main>
  `,
  styles: [`
    .host-studio {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 24px 80px;
      --studio-primary: #ba0036;
      --studio-bg: #fcf9f8;
      --studio-card: #ffffff;
      --studio-text: #1b1c1c;
      --studio-muted: #5c3f41;
      --studio-border: #e5bdbe;
      --studio-shadow: 0 12px 40px rgba(0,0,0,0.08);
      --studio-radius: 24px;
    }

    .studio-header {
      margin-bottom: 48px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .studio-badge {
      display: inline-block;
      padding: 6px 14px;
      background: #fdf2f2;
      color: var(--studio-primary);
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .studio-header h1 {
      font-size: 3.2rem;
      font-weight: 900;
      margin: 0 0 8px;
      letter-spacing: -0.03em;
    }

    .studio-header h1 .highlight {
      color: var(--studio-primary);
    }

    .studio-header p {
      font-size: 1.2rem;
      color: var(--studio-muted);
      margin: 0;
    }

    .stat-pill {
      background: var(--studio-card);
      padding: 20px 32px;
      border-radius: 20px;
      box-shadow: var(--studio-shadow);
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 1px solid var(--studio-border);
    }

    .stat-pill strong {
      font-size: 2.2rem;
      color: var(--studio-primary);
    }

    .stat-pill span {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--studio-muted);
      text-transform: uppercase;
    }

    .studio-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 40px;
      align-items: start;
    }

    .card-glass {
      background: var(--studio-card);
      border-radius: var(--studio-radius);
      padding: 40px;
      border: 1px solid var(--studio-border);
      box-shadow: var(--studio-shadow);
    }

    .card-header {
      display: flex;
      gap: 20px;
      align-items: center;
      margin-bottom: 40px;
    }

    .icon-bg {
      font-size: 32px;
      color: var(--studio-primary);
      background: #fdf2f2;
      padding: 16px;
      border-radius: 16px;
    }

    .card-header h2 {
      font-size: 1.8rem;
      font-weight: 800;
      margin: 0;
    }

    .card-header p {
      color: var(--studio-muted);
      margin: 4px 0 0;
    }

    .modern-form {
      display: grid;
      gap: 32px;
    }

    .form-section h3 {
      font-size: 1rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #888;
      margin-bottom: 20px;
      border-bottom: 1px solid #f0eded;
      padding-bottom: 8px;
    }

    .floating-label {
      display: grid;
      gap: 8px;
    }

    .floating-label span {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--studio-text);
    }

    .modern-form input, .modern-form select, .modern-form textarea {
      padding: 14px 18px;
      border: 2px solid #f0eded;
      border-radius: 14px;
      font-size: 1rem;
      background: #faf9f8;
      transition: all 0.2s;
    }

    .modern-form input:focus, .modern-form textarea:focus {
      border-color: var(--studio-primary);
      background: #fff;
      outline: none;
      box-shadow: 0 0 0 4px rgba(186, 0, 54, 0.05);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .input-with-prefix {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-prefix .prefix {
      position: absolute;
      left: 18px;
      font-weight: 800;
      color: var(--studio-primary);
    }

    .input-with-prefix input {
      padding-left: 36px;
      width: 100%;
    }

    .form-row-multi {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .counter-input {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }

    .counter-input span {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .counter-input input {
      text-align: center;
      padding: 12px 8px;
    }

    .submit-btn {
      margin-top: 20px;
      background: var(--studio-primary);
      color: #ffffff !important;
      border: 0;
      border-radius: 16px;
      padding: 20px;
      font-size: 1.1rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .submit-btn:hover {
      background: #a0002e;
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(186, 0, 54, 0.2);
    }

    .submit-btn:disabled {
      background: #ccc;
      transform: none;
      cursor: not-allowed;
    }

    .form-error {
      background: #fff5f5;
      color: #c53030;
      padding: 12px 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 0.9rem;
      border: 1px solid #feb2b2;
    }

    .inventory-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .inventory-header h3 {
      font-size: 1.4rem;
      font-weight: 900;
      margin: 0;
    }

    .count-chip {
      background: #1b1c1c;
      color: #fff;
      padding: 4px 12px;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .inventory-stack {
      display: grid;
      gap: 20px;
    }

    .property-studio-card {
      background: var(--studio-card);
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid var(--studio-border);
      display: grid;
      grid-template-columns: 120px 1fr;
      transition: all 0.2s;
    }

    .property-studio-card:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 20px rgba(0,0,0,0.05);
    }

    .card-visual {
      position: relative;
      height: 120px;
    }

    .card-visual img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .status-indicator {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(255, 255, 255, 0.9);
      padding: 3px 8px;
      border-radius: 99px;
      font-size: 0.65rem;
      font-weight: 800;
      color: #008558;
      text-transform: uppercase;
    }

    .card-info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .card-info h4 {
      margin: 0 0 4px;
      font-size: 1rem;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-info p {
      margin: 0;
      font-size: 0.85rem;
      color: var(--studio-muted);
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
    }

    .card-footer strong {
      color: var(--studio-primary);
      font-size: 1rem;
    }

    .card-footer small {
      color: #888;
      font-size: 0.75rem;
    }

    .icon-btn-delete {
      background: transparent;
      border: 0;
      color: #ccc;
      cursor: pointer;
      transition: color 0.2s;
    }

    .icon-btn-delete:hover {
      color: var(--studio-primary);
    }

    .empty-inventory {
      text-align: center;
      padding: 60px 20px;
      background: #f6f3f2;
      border-radius: 20px;
      border: 2px dashed #ddd;
    }

    .empty-inventory .material-symbols-outlined {
      font-size: 48px;
      color: #ccc;
      margin-bottom: 12px;
    }

    .toast-studio {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: #1b1c1c;
      color: #fff;
      padding: 16px 24px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 2000;
      transform: translateY(100px);
      transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    }

    .toast-studio.show {
      transform: translateY(0);
    }

    @media (max-width: 1100px) {
      .studio-layout {
        grid-template-columns: 1fr;
      }
      .studio-header h1 {
        font-size: 2.5rem;
      }
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
      }
    }

    @media (max-width: 768px) {
      .card-glass { padding: 24px; }
      .form-row-multi { grid-template-columns: 1fr 1fr; }
      .property-studio-card { grid-template-columns: 1fr; }
      .card-visual { height: 200px; }
      .studio-header h1 { font-size: 2rem; }
    }
  `]
})
export class HostPage {
  private readonly fb = inject(FormBuilder);
  private readonly propertiesApi = inject(PropertyService);
  protected readonly language = inject(LanguageService);

  protected readonly properties = signal<Property[]>([]);
  protected readonly notice = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    property_type: ['apartment', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
    price_per_night: [100, Validators.required],
    cleaning_fee: [0],
    max_guests: [2, Validators.required],
    bedrooms: [1, Validators.required],
    beds: [1, Validators.required],
    bathrooms: [1, Validators.required]
  });

  private readonly fallbackImages = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=85'
  ];

  constructor() {
    this.load();
  }

  create(): void {
    if (this.form.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.error.set('');
    this.propertiesApi.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.form.reset({
          title: '',
          description: '',
          property_type: 'apartment',
          address: '',
          city: '',
          country: '',
          price_per_night: 100,
          cleaning_fee: 0,
          max_guests: 2,
          bedrooms: 1,
          beds: 1,
          bathrooms: 1
        });
        this.load();
        this.showNotice(this.language.t('listingPublished'));
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err.status === 403) {
          this.error.set(this.language.t('noPermissionHost'));
        } else {
          this.error.set(this.language.t('couldNotPublish'));
        }
      }
    });
  }

  deleteProperty(id: number): void {
    if (confirm('Are you sure you want to delete this listing? This will remove all associated bookings and reviews.')) {
      this.propertiesApi.delete(id).subscribe(() => {
        this.load();
        this.showNotice(this.language.t('listingRemoved'));
      });
    }
  }

  showNotice(message: string): void {
    this.notice.set(message);
    window.setTimeout(() => this.notice.set(''), 4000);
  }

  fallbackImage(property: Property, index: number): string {
    const typeMap: Record<string, string> = {
      apartment: this.fallbackImages[7],
      house: this.fallbackImages[4],
      villa: this.fallbackImages[0],
      cabin: this.fallbackImages[1],
      room: this.fallbackImages[5],
      hotel: this.fallbackImages[6]
    };
    return typeMap[property.property_type] ?? this.fallbackImages[index % this.fallbackImages.length];
  }

  private load(): void {
    this.propertiesApi.mine().subscribe((page) => this.properties.set(page.results));
  }
}
