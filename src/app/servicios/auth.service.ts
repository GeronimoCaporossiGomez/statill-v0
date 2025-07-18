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
  // Additional methods can be added here
  getUsers(): Observable<any> {
    return this.http.get(this.apiUrl + '/api/v1/users/');
  }
}