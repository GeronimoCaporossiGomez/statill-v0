import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MiApiService {
  constructor(private http: HttpClient) {}

  getDatos() {
    return this.http.get('https://tu-api.com/endpoint');
  }
}
