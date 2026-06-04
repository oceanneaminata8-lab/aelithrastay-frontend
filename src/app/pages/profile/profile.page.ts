import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { User } from '../../core/models';
import { UserService } from '../../core/user.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-section narrow">
      <header class="profile-header">
        <div>
          <span class="eyebrow">{{ language.t('account') }}</span>
          <h1>{{ language.t('yourProfile') }}</h1>
        </div>
        @if (auth.currentUser(); as user) {
          <button class="icon-button" type="button" (click)="toggleEdit(user)" [attr.aria-label]="editing() ? 'Close editor' : 'Edit profile'">
            <span class="material-symbols-outlined">{{ editing() ? 'close' : 'edit' }}</span>
          </button>
        }
      </header>

      @if (auth.currentUser(); as user) {
        <div class="profile-card">
          <div class="profile-main">
            <label class="avatar-large" [class.editable]="editing()">
              @if (avatarPreview() || user.avatar) {
                <img [src]="avatarPreview() || user.avatar" [alt]="user.username" />
              } @else {
                <span class="material-symbols-outlined">account_circle</span>
              }
              @if (editing()) {
                <input type="file" accept="image/*" (change)="selectAvatar($event)" />
                <span class="avatar-action material-symbols-outlined">photo_camera</span>
              }
            </label>

            <div class="user-details">
              <h2>{{ displayName(user) }}</h2>
              <p class="username">@{{ user.username }}</p>
              <span class="role-badge">{{ user.role }}</span>
            </div>
          </div>

          <hr class="divider" />

          @if (!editing()) {
            <div class="profile-info">
              <div class="info-group">
                <span class="label">{{ language.t('emailAddress') }}</span>
                <p>{{ user.email }}</p>
              </div>
              <div class="info-group">
                <span class="label">{{ language.t('phoneNumber') }}</span>
                <p>{{ user.phone || language.t('notProvided') }}</p>
              </div>
              <div class="info-group">
                <span class="label">{{ language.t('about') }}</span>
                <p>{{ user.bio || language.t('noBioYet') }}</p>
              </div>
            </div>

            @if (message()) {
              <p class="notice profile-notice" [class.success]="messageType() === 'success'">{{ message() }}</p>
            }

            <div class="profile-actions">
              <button class="btn-primary" type="button" (click)="startEdit(user)">
                <span class="material-symbols-outlined">edit</span>
                {{ language.t('editProfile') }}
              </button>
              <button class="btn-outline" type="button" (click)="securityNotice()">
                <span class="material-symbols-outlined">shield_lock</span>
                {{ language.t('securitySettings') }}
              </button>
            </div>
          } @else {
            <form class="profile-form" [formGroup]="form" (ngSubmit)="save(user)">
              <div class="form-grid">
                <label>
                  {{ language.t('firstName') }}
                  <input formControlName="first_name" [placeholder]="language.t('firstName')" />
                </label>
                <label>
                  {{ language.t('lastName') }}
                  <input formControlName="last_name" [placeholder]="language.t('lastName')" />
                </label>
              </div>

              <label>
                {{ language.t('username') }}
                <input formControlName="username" [placeholder]="language.t('username')" />
                @if (form.controls.username.invalid && form.controls.username.touched) {
                  <small class="field-error">{{ language.t('usernameHint') }}</small>
                }
              </label>

              <label>
                {{ language.t('emailAddress') }}
                <input formControlName="email" type="email" placeholder="name@example.com" />
                @if (form.controls.email.invalid && form.controls.email.touched) {
                  <small class="field-error">Enter a valid email address.</small>
                }
              </label>

              <div class="form-grid">
                <label>
                  {{ language.t('phoneNumber') }}
                  <input formControlName="phone" type="tel" placeholder="+1 555 0100" />
                </label>
                <label>
                  {{ language.t('accountType') }}
                  <select formControlName="role">
                    <option value="guest">Guest</option>
                    <option value="host">Host</option>
                    @if (user.role === 'admin') {
                      <option value="admin">Admin</option>
                    }
                  </select>
                </label>
              </div>

              <label>
                {{ language.t('bio') }}
                <textarea formControlName="bio" rows="5" maxlength="600" placeholder="Share your travel style, hosting experience, or anything useful for bookings."></textarea>
                <small class="field-hint">{{ bioCount() }}/600 characters</small>
              </label>

              @if (selectedAvatarName()) {
                <p class="file-note">
                  <span class="material-symbols-outlined">image</span>
                  {{ selectedAvatarName() }}
                </p>
              }

              @if (message()) {
                <p class="notice" [class.success]="messageType() === 'success'">{{ message() }}</p>
              }

              <div class="profile-actions">
                <button class="btn-primary" type="submit" [disabled]="form.invalid || saving()">
                  <span class="material-symbols-outlined">save</span>
                  {{ saving() ? language.t('saving') : language.t('save') }}
                </button>
                <button class="btn-outline" type="button" (click)="cancelEdit(user)" [disabled]="saving()">
                  {{ language.t('close') }}
                </button>
              </div>
            </form>
          }
        </div>
      } @else {
        <div class="empty-state">
          <span class="material-symbols-outlined">login</span>
          <h3>{{ language.t('pleaseLogin') }}</h3>
          <p>{{ language.t('loginToViewProfile') }}</p>
          <a routerLink="/login" class="btn-primary">{{ language.t('loginNow') }}</a>
        </div>
      }
    </section>
  `,
  styles: [`
    .narrow { max-width: 920px; margin: 0 auto; padding: 64px 24px; }
    .profile-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 40px; }
    .eyebrow { color: #ba0036; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; display: block; }
    h1 { font-size: 2.5rem; font-weight: 900; margin: 0; }

    .profile-card { background: #fff; border: 1px solid #f0eded; border-radius: 24px; padding: 40px; box-shadow: 0 12px 32px rgba(0,0,0,0.06); }
    .profile-main { display: flex; align-items: center; gap: 32px; margin-bottom: 32px; }
    .avatar-large { position: relative; width: 120px; height: 120px; flex: 0 0 120px; border-radius: 50%; background: #f6f3f2; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .avatar-large.editable { cursor: pointer; }
    .avatar-large input { display: none; }
    .avatar-large > .material-symbols-outlined { font-size: 80px; color: #ccc; }
    .avatar-large img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-action { position: absolute; inset: auto 0 0; height: 38px; display: grid; place-items: center; background: rgba(27,28,28,0.72); color: #fff; font-size: 22px !important; }

    .user-details h2 { font-size: 1.8rem; font-weight: 800; margin: 0 0 4px; }
    .username { color: #5c3f41; font-weight: 600; margin: 0 0 12px; }
    .role-badge { display: inline-block; padding: 6px 16px; background: #fdf2f2; color: #ba0036; border-radius: 99px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; }
    .divider { border: 0; border-top: 1px solid #eee; margin: 32px 0; }

    .profile-info { display: grid; gap: 24px; }
    .info-group .label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #888; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
    .info-group p { font-size: 1.1rem; color: #1b1c1c; margin: 0; font-weight: 500; line-height: 1.6; }

    .profile-form { display: grid; gap: 22px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
    label { display: grid; gap: 8px; color: #1b1c1c; font-weight: 800; }
    input, select, textarea { width: 100%; border: 1px solid #eadfdd; border-radius: 14px; background: #fff; color: #1b1c1c; font: inherit; font-weight: 600; padding: 14px 16px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
    textarea { resize: vertical; min-height: 130px; line-height: 1.5; }
    input:focus, select:focus, textarea:focus { border-color: #ba0036; box-shadow: 0 0 0 4px rgba(186,0,54,0.08); }
    .field-hint, .field-error { font-size: 0.82rem; font-weight: 700; }
    .field-hint { color: #7f6b6d; }
    .field-error { color: #ba0036; }
    .file-note { display: inline-flex; align-items: center; gap: 8px; width: fit-content; padding: 10px 14px; margin: 0; border-radius: 999px; background: #f6f3f2; color: #5c3f41; font-weight: 800; }
    .file-note .material-symbols-outlined { font-size: 20px; color: #ba0036; }

    .profile-actions { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 40px; }
    .profile-form .profile-actions { margin-top: 8px; }
    .btn-primary, .btn-outline, .icon-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; cursor: pointer; transition: all 0.2s; font-weight: 800; }
    .btn-primary { min-height: 50px; padding: 14px 28px; background: #ba0036; color: #fff; border-radius: 12px; text-decoration: none; }
    .btn-primary:hover { background: #a0002e; transform: translateY(-2px); }
    .btn-primary:disabled, .btn-outline:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
    .btn-outline { min-height: 50px; padding: 14px 28px; background: transparent; border: 2px solid #f0eded; color: #1b1c1c; border-radius: 12px; }
    .btn-outline:hover { background: #f6f3f2; }
    .icon-button { width: 48px; height: 48px; flex: 0 0 48px; border-radius: 50%; background: #f6f3f2; color: #1b1c1c; }
    .icon-button:hover { background: #fdf2f2; color: #ba0036; }
    .notice { margin: 0; padding: 14px 16px; border-radius: 14px; background: #fff2f2; color: #ba0036; font-weight: 800; }
    .profile-notice { margin-top: 24px; }
    .notice.success { background: #eef8f0; color: #247a3d; }

    .empty-state { text-align: center; padding: 60px 0; }
    .empty-state .material-symbols-outlined { font-size: 64px; color: #ccc; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.5rem; margin: 0 0 8px; }
    .empty-state p { color: #5c3f41; margin: 0 0 24px; }

    @media (max-width: 680px) {
      .narrow { padding: 40px 18px; }
      .profile-card { padding: 28px 20px; border-radius: 20px; }
      .profile-main { align-items: flex-start; gap: 18px; }
      .avatar-large { width: 88px; height: 88px; flex-basis: 88px; }
      .avatar-large > .material-symbols-outlined { font-size: 58px; }
      .user-details h2 { font-size: 1.35rem; }
      .form-grid { grid-template-columns: 1fr; }
      .profile-actions { flex-direction: column; }
      .btn-primary, .btn-outline { width: 100%; }
    }
  `]
})
export class ProfilePage {
  protected readonly auth = inject(AuthService);
  protected readonly language = inject(LanguageService);
  private readonly fb = inject(FormBuilder);
  private readonly users = inject(UserService);

  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly messageType = signal<'error' | 'success'>('error');
  protected readonly avatarPreview = signal('');
  protected readonly selectedAvatarName = signal('');
  private selectedAvatar: File | null = null;

  protected readonly form = this.fb.nonNullable.group({
    first_name: [''],
    last_name: [''],
    username: ['', [Validators.required, Validators.pattern(/^[\w.@+-]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    role: ['guest' as User['role']],
    bio: ['']
  });
  protected readonly bioCount = computed(() => this.form.controls.bio.value.length);

  startEdit(user = this.auth.currentUser()): void {
    if (!user) return;
    this.form.reset({
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      role: user.role,
      bio: user.bio ?? ''
    });
    this.selectedAvatar = null;
    this.avatarPreview.set('');
    this.selectedAvatarName.set('');
    this.message.set('');
    this.editing.set(true);
  }

  toggleEdit(user: User): void {
    this.editing() ? this.cancelEdit(user) : this.startEdit(user);
  }

  cancelEdit(user: User): void {
    this.startEdit(user);
    this.editing.set(false);
    this.message.set('');
  }

  selectAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedAvatar = file;
    this.selectedAvatarName.set(file?.name ?? '');
    this.avatarPreview.set(file ? URL.createObjectURL(file) : '');
  }

  save(user: User): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');

    const values = this.form.getRawValue();
    const payload = new FormData();
    payload.append('first_name', values.first_name.trim());
    payload.append('last_name', values.last_name.trim());
    payload.append('username', values.username.trim());
    payload.append('email', values.email.trim());
    payload.append('phone', values.phone.trim());
    payload.append('role', values.role);
    payload.append('bio', values.bio.trim());
    if (this.selectedAvatar) {
      payload.append('avatar', this.selectedAvatar);
    }

    this.users.updateForm(user.id, payload).subscribe({
      next: (updatedUser) => {
        this.auth.setCurrentUser(updatedUser);
        this.saving.set(false);
        this.editing.set(false);
        this.selectedAvatar = null;
        this.avatarPreview.set('');
        this.selectedAvatarName.set('');
        this.messageType.set('success');
        this.message.set(this.language.t('profileUpdated'));
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.messageType.set('error');
        this.message.set(this.formatError(error));
      }
    });
  }

  securityNotice(): void {
    this.messageType.set('error');
    this.message.set(this.language.t('securitySettingsNotAvailable'));
  }

  displayName(user: User): string {
    return `${user.first_name} ${user.last_name}`.trim() || user.username;
  }

  private formatError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Could not reach the server. Please make sure the Django backend is running.';
    }
    if (error.status === 401) {
      return 'Your session has expired. Please log in again, then save your profile.';
    }
    if (typeof error.error === 'string') {
      return error.error;
    }
    if (error.error && typeof error.error === 'object') {
      const messages = Object.entries(error.error).map(([field, value]) => {
        const text = this.stringifyErrorValue(value);
        return `${field.replaceAll('_', ' ')}: ${text}`;
      });
      if (messages.length) return messages.join(' ');
    }
    return 'Profile update failed. Please check your details.';
  }

  private stringifyErrorValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value.map((item) => this.stringifyErrorValue(item)).join(' ');
    }
    if (value && typeof value === 'object') {
      return Object.values(value).map((item) => this.stringifyErrorValue(item)).join(' ');
    }
    return String(value);
  }
}
