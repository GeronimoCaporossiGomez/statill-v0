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
  store_role: string | null; // Cambiado a string para más flexibilidad
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

  private currentUserSubject = new BehaviorSubject<UserRead | null>(
    this.getStoredUser(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    console.log('🔧 AuthService inicializado');
    const storedUser = this.getStoredUser();
    console.log('👤 Usuario almacenado:', storedUser);

    // Si hay token pero no usuario, intentar obtenerlo
    if (this.getToken() && !this.currentUserSubject.value) {
      console.log('⚠️ Hay token pero no usuario, obteniendo datos...');
      this.fetchCurrentUser().subscribe();
    }
  }

  // ============ TOKEN MANAGEMENT ============

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('🔑 Token:', token ? 'Existe' : 'No existe');
    return token;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    console.log('✅ Token guardado');
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    console.log('🗑️ Token eliminado');
  }

  // ============ USER MANAGEMENT ============

  private getStoredUser(): UserRead | null {
    const stored = localStorage.getItem(this.USER_KEY);
    const user = stored ? JSON.parse(stored) : null;
    console.log('📦 Usuario del localStorage:', user);
    return user;
  }

  private setUser(user: UserRead): void {
    console.log('💾 Guardando usuario:', user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    console.log('🗑️ Usuario eliminado');
  }

  getCurrentUser(): UserRead | null {
    const user = this.currentUserSubject.value;
    console.log('👤 getCurrentUser():', user);
    return user;
  }

  // ============ AUTHENTICATION METHODS ============

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

    return this.http
      .post<LoginResponse>(
        this.apiUrl + '/api/v1/auth/token',
        body.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      )
      .pipe(
        tap((response) => {
          if (response.successful && response.data?.token) {
            this.setToken(response.data.token);
            // Fetch user info after successful login
            this.fetchCurrentUser().subscribe();
          }
        }),
      );
  }

  fetchCurrentUser(): Observable<GetUserResponse> {
    console.log('🌐 Obteniendo usuario del servidor...');
    return this.http
      .get<GetUserResponse>(this.apiUrl + '/api/v1/users/me')
      .pipe(
        tap((response) => {
          console.log('📥 Respuesta del servidor:', response);
          if (response.successful && response.data) {
            console.log('✅ Usuario obtenido:', response.data);
            console.log('📋 store_role:', response.data.store_role);
            console.log('📋 store_id:', response.data.store_id);
            console.log('📋 email_verified:', response.data.email_verified);
            this.setUser(response.data);
          }
        }),
        catchError((error) => {
          console.error('❌ Error al obtener usuario:', error);
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => error);
        }),
      );
  }

  activateAccount(code: string): Observable<any> {
    return this.http
      .patch(this.apiUrl + '/api/v1/auth/activate', null, {
        params: { code },
      })
      .pipe(
        tap(() => {
          console.log('✅ Cuenta activada');
          this.fetchCurrentUser().subscribe();
        }),
      );
  }

  sendEmailVerificationCode(): Observable<any> {
    return this.http.get(
      this.apiUrl + '/api/v1/auth/send-email-verification-code',
    );
  }

  isAuthenticated(): boolean {
    const authenticated = !!this.getToken();
    console.log('🔐 isAuthenticated():', authenticated);
    return authenticated;
  }

  isActiveUser(): boolean {
    const user = this.getCurrentUser();
    const active = this.isAuthenticated() && (user?.email_verified ?? false);
    console.log('🔐 isActiveUser():', active);
    console.log('  - Token existe:', this.isAuthenticated());
    console.log('  - Email verificado:', user?.email_verified);
    return active;
  }

  isOwner(): boolean {
    const user = this.getCurrentUser();
    const owner = this.isActiveUser() && user?.store_role === 'owner';
    console.log('🔐 isOwner():', owner);
    console.log('  - Usuario activo:', this.isActiveUser());
    console.log('  - store_role:', user?.store_role);
    console.log('  - store_id:', user?.store_id);
    return owner;
  }

  isCashier(): boolean {
    const user = this.getCurrentUser();
    const cashier = this.isActiveUser() && user?.store_role === 'cashier';
    console.log('🔐 isCashier():', cashier);
    return cashier;
  }

  isOwnerOrCashier(): boolean {
    const user = this.getCurrentUser();
    const hasAccess =
      this.isActiveUser() &&
      (user?.store_role === 'owner' || user?.store_role === 'cashier');
    console.log('🔐 isOwnerOrCashier():', hasAccess);
    return hasAccess;
  }

  hasStore(): boolean {
    const user = this.getCurrentUser();
    const hasStore = this.isActiveUser() && !!user?.store_id;
    console.log('🔐 hasStore():', hasStore);
    return hasStore;
  }

  getStoreId(): number | null {
    const storeId = this.getCurrentUser()?.store_id ?? null;
    console.log('🏪 getStoreId():', storeId);
    return storeId;
  }

  logout(): void {
    console.log('👋 Cerrando sesión...');
    this.removeToken();
    this.removeUser();
    this.router.navigate(['/landing']);
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('❌ No hay token');
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000;
      const valid = Date.now() < expiration;
      console.log('🔑 Token válido:', valid);
      console.log('  - Expira:', new Date(expiration));
      return valid;
    } catch (error) {
      console.error('❌ Token inválido:', error);
      return false;
    }
  }
}
