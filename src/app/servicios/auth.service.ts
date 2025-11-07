import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginResponse {
  successful: boolean;
  data: {
    token: string;
    token_type: string;
  };
  message: string;
}

export interface UserRead {
  id: number;
  first_names: string;
  last_name: string;
  email: string;
  birthdate: string;
  gender: 'M' | 'F' | 'X';
  res_area: string;
  store_id: number | null;
  store_role: 'owner' | 'cashier' | null;
  email_verified: boolean;
}

export interface GetUserResponse {
  successful: boolean;
  data: UserRead;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://statill-api.onrender.com';
  private readonly TOKEN_KEY = 'statill_token';
  private readonly USER_KEY = 'statill_user';
  
  private currentUserSubject = new BehaviorSubject<UserRead | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Si hay token pero no usuario, intentar obtenerlo
    if (this.getToken() && !this.currentUserSubject.value) {
      this.fetchCurrentUser().subscribe();
    }
  }

  // ============ TOKEN MANAGEMENT ============
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // ============ USER MANAGEMENT ============
  
  private getStoredUser(): UserRead | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private setUser(user: UserRead): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): UserRead | null {
    return this.currentUserSubject.value;
  }

  // ============ AUTHENTICATION METHODS ============
  
  /**
   * Register a new user
   */
  registerUser(user: {
    first_names: string;
    last_name: string;
    password: string;
    email: string;
    gender: string;
    birthdate: string;
    res_area: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl + '/api/v1/users/', user);
  }

  /**
   * Request an access token using email + password
   * Returns LoginResponse with token
   */
  requestToken(payload: {
    grant_type?: string;
    username: string;
    password: string;
    scope?: string;
    client_id?: string;
    client_secret?: string;
  }): Observable<LoginResponse> {
    const body = new URLSearchParams();
    body.set('grant_type', payload.grant_type || 'password');
    body.set('username', payload.username);
    body.set('password', payload.password);
    if (payload.scope) body.set('scope', payload.scope);
    if (payload.client_id) body.set('client_id', payload.client_id);
    if (payload.client_secret) body.set('client_secret', payload.client_secret);
    
    return this.http.post<LoginResponse>(
      this.apiUrl + '/api/v1/auth/token',
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).pipe(
      tap(response => {
        if (response.successful && response.data?.token) {
          this.setToken(response.data.token);
          // Fetch user info after successful login
          this.fetchCurrentUser().subscribe();
        }
      })
    );
  }

  /**
   * Get current authenticated user
   */
  fetchCurrentUser(): Observable<GetUserResponse> {
    return this.http.get<GetUserResponse>(this.apiUrl + '/api/v1/users/me').pipe(
      tap(response => {
        if (response.successful && response.data) {
          this.setUser(response.data);
        }
      }),
      catchError(error => {
        // Si el token es inválido, limpiar sesión
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Activate account using code sent by email
   * IMPORTANT: This is a PATCH request, not GET
   */
  activateAccount(code: string): Observable<any> {
    return this.http.patch(this.apiUrl + '/api/v1/auth/activate', null, {
      params: { code }
    }).pipe(
      tap(() => {
        // After activation, refresh user info to get updated email_verified status
        this.fetchCurrentUser().subscribe();
      })
    );
  }

  /**
   * Send email verification code to authenticated user
   */
  sendEmailVerificationCode(): Observable<any> {
    return this.http.get(this.apiUrl + '/api/v1/auth/send-email-verification-code');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if user is active (authenticated + email verified)
   */
  isActiveUser(): boolean {
    const user = this.getCurrentUser();
    return this.isAuthenticated() && (user?.email_verified ?? false);
  }

  /**
   * Check if user is store owner
   */
  isOwner(): boolean {
    const user = this.getCurrentUser();
    return this.isActiveUser() && user.store_role === 'owner';
  }
  
  isCashier(): boolean {
    const user = this.getCurrentUser();
    return this.isActiveUser() && user.store_role === 'cashier';
  }
  isOwnerOrCashier(): boolean {
    const user = this.getCurrentUser();
    return this.isActiveUser() && (user.store_role === 'owner' || user.store_role === 'cashier');
  }
  /**
   * Check if user has store (owner or cashier)
   */
  hasStore(): boolean {
    const user = this.getCurrentUser();
    return this.isActiveUser() && !!user.store_id;
  }

  /**
   * Get user's store ID
   */
  getStoreId(): number | null {
    return this.getCurrentUser()?.store_id ?? null;
  }

  /**
   * Logout user
   */
  logout(): void {
    this.removeToken();
    this.removeUser();
    this.router.navigate(['/landing']);
  }

  /**
   * Check if token exists and is valid (basic check)
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Basic token validation (check if it's not expired)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiration;
    } catch {
      return false; // Invalid token format
    }
  }

  getUserFirstName(id: number){
    return this.http.get(`/api/v1/users/${id}/name/`)
  }
}
