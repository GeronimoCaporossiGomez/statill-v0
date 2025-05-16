import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;

  login(email: string, password: string): boolean {
    // Simula autenticación
    if (email === 'demo@statill.com' && password === '1234') {
      this.loggedIn = true;
      localStorage.setItem('token', 'demo-token');
      return true;
    }
    return false;
  }

  logout(): void {
    this.loggedIn = false;
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return this.loggedIn || !!localStorage.getItem('token');
  }
  // auth.service.ts
register(email: string, password: string): boolean {
  const exists = localStorage.getItem(`user-${email}`);
  if (exists) return false;

  localStorage.setItem(`user-${email}`, password);
  localStorage.setItem('token', 'demo-token');
  return true;
}

}
