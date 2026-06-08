import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('AelithraStay');
  });

  it('should open and close the mobile navigation', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as App & {
      mobileMenuOpen: boolean;
      toggleMobileMenu(): void;
      closeMobileMenu(): void;
    };

    app.toggleMobileMenu();
    expect(app.mobileMenuOpen).toBe(true);

    app.closeMobileMenu();
    expect(app.mobileMenuOpen).toBe(false);
  });
});
