import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/welcome.page').then(m => m.WelcomePage),
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage),
      },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
      },
      {
        path: 'patient',
        canActivate: [roleGuard(['patient'])],
        loadComponent: () => import('./pages/dashboard/patient/patient-dashboard.page').then(m => m.PatientDashboardPage),
      },
      {
        path: 'driver',
        canActivate: [roleGuard(['driver'])],
        loadComponent: () => import('./pages/dashboard/driver/driver-dashboard.page').then(m => m.DriverDashboardPage),
      },
      {
        path: 'admin',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () => import('./pages/dashboard/admin/admin-dashboard.page').then(m => m.AdminDashboardPage),
      },
    ],
  },
  {
    path: 'rides',
    canActivate: [authGuard],
    children: [
      {
        path: 'book',
        canActivate: [roleGuard(['patient'])],
        loadComponent: () => import('./pages/rides/book-ride/book-ride.page').then(m => m.BookRidePage),
      },
      {
        path: 'history',
        loadComponent: () => import('./pages/rides/ride-history/ride-history.page').then(m => m.RideHistoryPage),
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./pages/rides/ride-details/ride-details.page').then(m => m.RideDetailsPage),
      },
      {
        path: 'tracking/:id',
        loadComponent: () => import('./pages/rides/ride-tracking/ride-tracking.page').then(m => m.RideTrackingPage),
      },
    ],
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
  },
  {
    path: 'payments',
    canActivate: [authGuard],
    children: [
      {
        path: 'history',
        loadComponent: () => import('./pages/payments/payment-history/payment-history.page').then(m => m.PaymentHistoryPage),
      },
      {
        path: 'process/:rideId',
        loadComponent: () => import('./pages/payments/payment-process/payment-process.page').then(m => m.PaymentProcessPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/welcome',
  },
];
