import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'patient' | 'driver' | 'admin';
  createdAt: string;
  driverInfo?: any;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'patient' | 'driver' | 'admin';
  licenseNumber?: string;
  vehicleType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Initialize authentication state on app startup
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      this.verifyToken().subscribe({
        next: (response: any) => {
          this.setCurrentUser(response.user);
          this.setAuthenticationState(true);
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  // Login user
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.storeTokens(response.tokens);
          this.setCurrentUser(response.user);
          this.setAuthenticationState(true);
        }),
        catchError(this.handleError)
      );
  }

  // Register new user
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.storeTokens(response.tokens);
          this.setCurrentUser(response.user);
          this.setAuthenticationState(true);
        }),
        catchError(this.handleError)
      );
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.setCurrentUser(null);
    this.setAuthenticationState(false);
    this.router.navigate(['/welcome']);
  }

  // Verify token
  verifyToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify`)
      .pipe(catchError(this.handleError));
  }

  // Refresh access token
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((response: any) => {
          this.storeTokens(response.tokens);
        }),
        catchError(this.handleError)
      );
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Check if user has specific role
  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  // Get access token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Store tokens in localStorage
  private storeTokens(tokens: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
  }

  // Set current user
  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  // Set authentication state
  private setAuthenticationState(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  // Handle HTTP errors
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error && error.error.error) {
      errorMessage = error.error.error;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Auth Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Navigate based on user role
  navigateToRoleDashboard(): void {
    const user = this.getCurrentUser();
    if (!user) return;

    switch (user.role) {
      case 'patient':
        this.router.navigate(['/dashboard/patient']);
        break;
      case 'driver':
        this.router.navigate(['/dashboard/driver']);
        break;
      case 'admin':
        this.router.navigate(['/dashboard/admin']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }
}
