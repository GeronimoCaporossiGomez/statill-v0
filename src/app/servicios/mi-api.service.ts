import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MiApiService {
  constructor(private http: HttpClient) {}
  private apiUrl = 'https://statill-api.onrender.com';
  getDatos() {
    return this.http.get(this.apiUrl + '/api/v1/products/');
  }
  crearProducto(producto: any) {
  return this.http.post(this.apiUrl + '/api/v1/products/', producto);
}
}
