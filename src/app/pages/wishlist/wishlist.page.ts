import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistItem } from '../../core/models';
import { WishlistService } from '../../core/wishlist.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-wishlist-page',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <section class="page-section">
      <header class="section-header">
        <span class="eyebrow">{{ language.t('saved') }}</span>
        <h1>{{ language.t('yourWishlist') }}</h1>
      </header>

      <div class="stay-grid">
        @for (item of items(); track item.id; let i = $index) {
          <article class="stay-card">
            <div class="stay-photo-container">
              <a [routerLink]="['/properties', item.property]" class="stay-photo">
                @if (item.property_detail.images.length) {
                  <img [src]="item.property_detail.images[0].image" [alt]="item.property_detail.title" />
                } @else {
                  <img [src]="fallbackImage(item.property_detail, i)" [alt]="item.property_detail.title" />
                }
              </a>
              <button type="button" class="favorite-btn active" (click)="remove(item.id)">
                <span class="material-symbols-outlined filled">favorite</span>
              </button>
              <div class="property-tag">{{ item.property_detail.property_type }}</div>
            </div>
            
            <div class="stay-card-body">
              <div class="card-title-row">
                <h3>{{ item.property_detail.title }}</h3>
                <div class="rating">
                  <span class="material-symbols-outlined">star</span>
                  <span>{{ item.property_detail.average_rating || language.t('new') }}</span>
                </div>
              </div>
              <p class="location">{{ item.property_detail.city }}, {{ item.property_detail.country }}</p>
              <div class="price-row">
                <span class="price">{{ item.property_detail.price_per_night | currency:'XAF':'symbol':'1.0-0' }}</span>
                <span class="unit">/ {{ language.t('night') }}</span>
              </div>
              <button type="button" class="btn-remove" (click)="remove(item.id)">{{ language.t('removeFromWishlist') }}</button>
            </div>
          </article>
        } @empty {
          <div class="empty-state">
            <span class="material-symbols-outlined">favorite_border</span>
            <h3>{{ language.t('noSavedStays') }}</h3>
            <p>{{ language.t('clickHeartToSave') }}</p>
            <a routerLink="/" class="btn-primary">{{ language.t('exploreProperties') }}</a>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .section-header { margin-bottom: 40px; }
    .page-section { max-width: 1400px; margin: 0 auto; padding: 48px 5vw; }
    .eyebrow { color: #ba0036; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; display: block; }
    h1 { font-size: 2.5rem; font-weight: 900; margin: 0; }
    
    .stay-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 32px; }
    .stay-card { text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: 16px; }
    
    .stay-photo-container { position: relative; aspect-ratio: 1; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
    .stay-photo { width: 100%; height: 100%; display: block; }
    .stay-photo img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .stay-card:hover .stay-photo img { transform: scale(1.08); }
    
    .favorite-btn { position: absolute; top: 16px; right: 16px; background: transparent; border: 0; color: #ba0036; cursor: pointer; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); transition: transform 0.2s; }
    .favorite-btn:hover { transform: scale(1.2); }
    .favorite-btn .filled { font-variation-settings: 'FILL' 1; }
    
    .property-tag { position: absolute; bottom: 16px; left: 16px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(4px); padding: 6px 14px; border-radius: 99px; font-size: 0.75rem; font-weight: 800; color: #1b1c1c; text-transform: uppercase; }
    
    .stay-card-body h3 { font-size: 1.15rem; font-weight: 800; margin: 0; }
    .card-title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .rating { display: flex; align-items: center; gap: 4px; font-weight: 700; font-size: 0.95rem; }
    .rating .material-symbols-outlined { font-size: 18px; color: #ffb800; font-variation-settings: 'FILL' 1; }
    .location { color: #5c3f41; margin: 0; font-size: 0.95rem; }
    .price-row { display: flex; align-items: baseline; gap: 4px; }
    .price { font-size: 1.25rem; font-weight: 800; color: #ba0036; }
    .unit { color: #5c3f41; font-size: 0.9rem; font-weight: 500; }
    
    .btn-remove { margin-top: 12px; background: transparent; border: 1px solid #ddd; padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-remove:hover { background: #fff1f1; border-color: #ba0036; color: #ba0036; }
    
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 80px 0; }
    .empty-state .material-symbols-outlined { font-size: 64px; color: #ccc; margin-bottom: 16px; }
    .btn-primary { display: inline-block; margin-top: 24px; padding: 14px 32px; background: #ba0036; color: white !important; border-radius: 14px; font-weight: 800; text-decoration: none; }

    @media (max-width: 768px) {
      .stay-grid { grid-template-columns: 1fr; }
      h1 { font-size: 2rem; }
    }
  `]
})
export class WishlistPage {
  private readonly wishlistApi = inject(WishlistService);
  protected readonly language = inject(LanguageService);
  protected readonly items = signal<WishlistItem[]>([]);

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

  remove(id: number): void {
    this.wishlistApi.remove(id).subscribe(() => this.load());
  }

  fallbackImage(property: any, index: number): string {
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
    this.wishlistApi.list().subscribe((page) => this.items.set(page.results));
  }
}
