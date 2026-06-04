import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-admin-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-shell admin-login-shell">
      <div class="destination-wall" aria-hidden="true">
        <article class="destination-card card-paris">
          <div>
            <span>Douala</span>
            <small>Cameroon</small>
          </div>
        </article>
        <article class="destination-card card-miami">
          <div>
            <span>Yaoundé</span>
            <small>Cameroon</small>
          </div>
        </article>
        <article class="destination-card card-tokyo">
          <div>
            <span>Kribi</span>
            <small>Cameroon</small>
          </div>
        </article>
        <article class="destination-card card-rio">
          <div>
            <span>Limbe</span>
            <small>Cameroon</small>
          </div>
        </article>
        <article class="destination-card card-marrakech">
          <div>
            <span>Buea</span>
            <small>Cameroon</small>
          </div>
        </article>
        <article class="destination-card card-sydney">
          <div>
            <span>Bamenda</span>
            <small>Cameroon</small>
          </div>
        </article>
      </div>
      <div class="auth-card admin-login-card">
        <div class="auth-card-head">
          <div class="auth-mark admin-mark">
            <span class="material-symbols-outlined">admin_panel_settings</span>
          </div>
          <h1>{{ language.t('adminPortal') }}</h1>
          <p>{{ language.t('adminSubtitle') }}</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>{{ language.t('adminEmail') }}<input formControlName="email" type="email" placeholder="admin@aelithrastay.com" /></label>
          <label>
            <span class="label-row">{{ language.t('password') }}</span>
            <input formControlName="password" type="password" placeholder="{{ language.t('password') }}" />
          </label>
          <label class="check-row">
            <input type="checkbox" formControlName="rememberMe" />
            <span>{{ language.t('rememberDevice') }}</span>
          </label>
          @if (error()) {
            <p class="notice error">{{ error() }}</p>
          }
          <button type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? language.t('authenticating') : language.t('enterAdminPanel') }}
          </button>
        </form>

        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--admin-border); text-align: center;">
          <p style="font-size: 0.9rem; color: var(--admin-muted);">
            {{ language.t('notAnAdmin') }} <a routerLink="/login" style="color: var(--admin-primary); text-decoration: none; font-weight: 600;">{{ language.t('backToLogin') }}</a>
          </p>
        </div>
      </div>
    </section>

    @if (notice()) {
      <p class="toast">{{ notice() }}</p>
    }
  `,
  styles: [`
    .admin-login-shell {
      --admin-primary: #ba0036;
      --admin-bg: #fcf9f8;
      --admin-border: #e5bdbe;
      --admin-muted: #5c3f41;
      background: var(--admin-bg);
    }

    .admin-login-card {
      max-width: 400px;
    }

    .admin-mark {
      background: linear-gradient(135deg, var(--admin-primary), #8b0028);
      color: white;
    }

    .admin-login-card h1 {
      color: var(--admin-primary);
      font-size: 1.8rem;
    }

    .admin-login-card .notice.error {
      background-color: #ffe5e5;
      border-color: var(--admin-primary);
      color: var(--admin-primary);
    }
  `]
})
export class AdminLoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    
    const { email, password, rememberMe } = this.form.getRawValue();
    
    // Use email as username for login
    this.auth.login(email, password).subscribe({
      next: () => {
        this.auth.loadMe().subscribe({
          next: (user) => {
            // Check if user is admin
            if (user?.role === 'admin') {
              if (rememberMe) {
                localStorage.setItem('adminDeviceRemembered', 'true');
              }
              this.router.navigateByUrl('/admin');
            } else {
              this.error.set('Access denied. Admin credentials required.');
              this.loading.set(false);
            }
          },
          error: () => {
            this.error.set('Failed to verify admin status.');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.error.set('Invalid admin email or password.');
        this.loading.set(false);
      }
    });
  }
}
