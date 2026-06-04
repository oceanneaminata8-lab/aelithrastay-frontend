import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-shell register-shell">
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
      <div class="auth-card register-card">
        <div class="register-head">
          <h1>{{ language.t('createAccount') }}</h1>
          <p>{{ language.t('registerSubtitle') }}</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            {{ language.t('username') }}
            <input formControlName="username" placeholder="john_doe" />
            <small class="field-hint">{{ language.t('usernameHint') }}</small>
          </label>
          <label>{{ language.t('email') }}<input formControlName="email" type="email" placeholder="name@example.com" /></label>
          <div class="form-grid">
            <label>{{ language.t('firstName') }}<input formControlName="first_name" placeholder="John" /></label>
            <label>{{ language.t('lastName') }}<input formControlName="last_name" placeholder="Doe" /></label>
          </div>
          <label>{{ language.t('password') }}<input formControlName="password" type="password" placeholder="********" /></label>
          <label class="host-toggle">
            <span>
              <strong>{{ language.t('hostToggleLabel') }}</strong>
              <small>{{ language.t('hostToggleNote') }}</small>
            </span>
            <select formControlName="role">
              <option value="guest">Guest</option>
              <option value="host">Host</option>
            </select>
          </label>
          <p class="terms">{{ language.t('termsAgreement') }}</p>
          @if (error()) {
            <p class="notice">{{ error() }}</p>
          }
          <button type="submit" [disabled]="form.invalid || loading()">{{ loading() ? language.t('creating') : language.t('signUp') }}</button>
        </form>

        <div class="divider"><span>or</span></div>
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

        <p class="auth-switch">{{ language.t('alreadyHaveAccount') }} <a routerLink="/login">{{ language.t('logInLink') }}</a></p>
      </div>
    </section>

    @if (notice()) {
      <p class="toast">{{ notice() }}</p>
    }
  `
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.pattern(/^[\w.@+-]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    first_name: [''],
    last_name: [''],
    role: ['guest' as 'guest' | 'host'],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const payload = this.form.getRawValue();
    this.auth.register({
      ...payload,
      username: payload.username.trim(),
      email: payload.email.trim(),
      first_name: payload.first_name.trim(),
      last_name: payload.last_name.trim()
    }).subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: (error: HttpErrorResponse) => {
        this.error.set(this.formatError(error));
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

    this.notice.set(`${provider} registration is not available yet.`);
    window.setTimeout(() => this.notice.set(''), 3000);
  }

  private formatError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Could not reach the server. Please make sure the Django backend is running.';
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    if (error.error && typeof error.error === 'object') {
      const messages = Object.entries(error.error).flatMap(([field, value]) => {
        const text = Array.isArray(value) ? value.join(' ') : String(value);
        return `${this.prettyField(field)}: ${text}`;
      });
      if (messages.length) {
        return messages.join(' ');
      }
    }

    return 'Registration failed. Please check your details.';
  }

  private prettyField(field: string): string {
    return field.replaceAll('_', ' ').replace(/^\w/, (char) => char.toUpperCase());
  }
}
