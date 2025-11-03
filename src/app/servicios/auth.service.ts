import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://statill-api.onrender.com';

  constructor(private http: HttpClient) {}

  // Register a new user
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

  // Log in a user
  loginUser(credentials: {
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl + '/api/v1/login/', credentials);
  }
  
  // Request an access token using email + password
  requestToken(payload: {
    grant_type: string;
    username: string;
    password: string;
    scope?: string;
    client_id?: string;
    client_secret?: string;
  }): Observable<any> {
    // Create URLSearchParams for form-urlencoded format
    const body = new URLSearchParams();
    body.set('grant_type', payload.grant_type || 'password');
    body.set('username', payload.username);
    body.set('password', payload.password);
    if (payload.scope) body.set('scope', payload.scope);
    if (payload.client_id) body.set('client_id', payload.client_id);
    if (payload.client_secret) body.set('client_secret', payload.client_secret);
    
    return this.http.post(this.apiUrl + '/api/v1/auth/token', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  // Activate account using code sent by email
  activateAccount(code: string): Observable<any> {
    return this.http.get(this.apiUrl + '/api/v1/auth/activate', {
      params: { code }
    });
  }
  // Additional methods can be added here
  getUsers(): Observable<any> {
    return this.http.get(this.apiUrl + '/api/v1/users/');
  }
}