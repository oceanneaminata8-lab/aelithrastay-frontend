import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-shell">
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
      <div class="auth-card">
        <div class="auth-card-head">
          <div class="auth-mark">
            <span class="material-symbols-outlined">domain</span>
          </div>
          <h1>{{ language.t('welcomeBack') }}</h1>
          <p>{{ language.t('loginSubtitle') }}</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            {{ language.t('username') }}
            <input formControlName="username" [placeholder]="language.t('username')" [class.invalid]="isInvalid('username')" />
            @if (isInvalid('username')) {
              <small class="error-text">Username is required.</small>
            }
          </label>
          <label>
            <span class="label-row">{{ language.t('password') }} <a href="#">{{ language.t('forgotPassword') }}</a></span>
            <input formControlName="password" type="password" [placeholder]="language.t('password')" [class.invalid]="isInvalid('password')" />
            @if (isInvalid('password')) {
              <small class="error-text">Password is required.</small>
            }
          </label>
          <label class="check-row">
            <input type="checkbox" />
            <span>{{ language.t('rememberMe') }}</span>
          </label>
          @if (error()) {
            <p class="notice">{{ error() }}</p>
          }
          <button type="submit" [disabled]="loading()">{{ loading() ? language.t('signingIn') : language.t('logIn') }}</button>
          </form>

          <div class="divider"><span>{{ language.t('orContinueWith') }}</span></div>

        <div class="social-grid">
          <button type="button" class="google-login" (click)="socialLogin('Google')">
            <span class="social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" width="18" height="18">
                <path d="M21.35 11.1h-9.2v2.8h5.25c-.23 1.35-1.15 2.5-2.45 3.25v2.7h3.95c2.3-2.1 3.65-5.25 3.65-8.95 0-.75-.07-1.45-.2-2.15z" fill="#4285F4"/>
                <path d="M12.15 22c2.6 0 4.8-.85 6.4-2.3l-3.95-2.7c-1.1.75-2.45 1.2-4.05 1.2-3.1 0-5.75-2.1-6.7-5.05H1.4v3.15C3 19.7 7.3 22 12.15 22z" fill="#34A853"/>
                <path d="M5.45 13.15a7.05 7.05 0 0 1 0-4.4V5.6H1.4a11.95 11.95 0 0 0 0 7.85l4.05-0.3z" fill="#FBBC05"/>
                <path d="M12.15 4.75c1.45 0 2.75.5 3.8 1.5l2.85-2.85C16.95 1.7 14.75 1 12.15 1 7.3 1 3 3.3 1.4 6.85l4.05 3.15c.95-3 3.6-5.25 6.7-5.25z" fill="#EA4335"/>
              </svg>
            </span>
            Google
          </button>
          <button type="button" class="apple-login" (click)="socialLogin('Apple')">
            <span class="social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="18" height="18">
                <path d="M16.365 1.43c0 1.14-.93 2.17-2.1 2.17s-2.1-1.04-2.1-2.17c0-1.14.95-2.17 2.1-2.17s2.1 1.03 2.1 2.17z"/>
                <path d="M20.62 15.99c-.14 2.48-1.63 4.4-3.42 4.4-1.29 0-2.16-.86-3.27-.86-1.1 0-1.86.84-3.06.84-1.56 0-3.1-1.49-3.19-3.91-.06-2.05 1.2-3.85 2.45-3.85 1.1 0 1.8.83 3.28.83 1.44 0 2.34-0.84 3.24-0.84.27 0 1.85.11 2.76 1.63-.07.05-1.68 1-1.62 3.7z"/>
              </svg>
            </span>
            Apple
          </button>
        </div>

        <p class="auth-switch">{{ language.t('dontHaveAccount') }} <a routerLink="/register">{{ language.t('signUp') }}</a></p>
      </div>
    </section>

    @if (notice()) {
      <p class="toast">{{ notice() }}</p>
    }
  `,
  styles: [`
    .error-text {
      color: #ba0036;
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: -4px;
      display: block;
    }
    input.invalid {
      border-color: #ba0036 !important;
      background-color: #fff8f8;
    }
    .notice {
      background-color: #fff5f5;
      color: #ba0036;
      border: 1px solid #ffcfcf;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-weight: 500;
      font-size: 0.9rem;
    }
  `]
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please fill in all required fields.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => {
        this.notice.set('Login successful! Redirecting...');
        this.auth.loadMe().subscribe({
          next: () => this.router.navigateByUrl('/'),
          error: () => this.router.navigateByUrl('/')
        });
      },
      error: () => {
        this.error.set('Invalid username or password.');
        this.loading.set(false);
      }
    });
  }

  socialLogin(provider: string): void {
    const urls: Record<string, string> = {
      Google: 'https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin',
      Apple: 'https://appleid.apple.com/'
    };

    const url = urls[provider];
    if (url) {
      window.open(url, '_blank', 'noopener');
      return;
    }

    this.notice.set(`${provider} login is not available yet.`);
    window.setTimeout(() => this.notice.set(''), 3000);
  }
}
