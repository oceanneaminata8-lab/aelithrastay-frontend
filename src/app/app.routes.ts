import { Routes } from '@angular/router';
import { AdminDashboardPage } from './pages/admin-dashboard/admin-dashboard.page';
import { AdminLoginPage } from './pages/admin-login/admin-login.page';
import { BookingConfirmationPage } from './pages/booking-confirmation/booking-confirmation.page';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { BookingsPage } from './pages/bookings/bookings.page';
import { HomePage } from './pages/home/home.page';
import { HostPage } from './pages/host/host.page';
import { LoginPage } from './pages/login/login.page';
import { ProfilePage } from './pages/profile/profile.page';
import { PropertyDetailPage } from './pages/property-detail/property-detail.page';
import { RegisterPage } from './pages/register/register.page';
import { WishlistPage } from './pages/wishlist/wishlist.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'properties/:id', component: PropertyDetailPage },
  { path: 'login', component: LoginPage },
  { path: 'admin-login', component: AdminLoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'host', component: HostPage, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardPage, canActivate: [adminGuard] },
  { path: 'bookings', component: BookingsPage, canActivate: [authGuard] },
  { path: 'booking-confirmation/:id', component: BookingConfirmationPage, canActivate: [authGuard] },
  { path: 'wishlist', component: WishlistPage, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
