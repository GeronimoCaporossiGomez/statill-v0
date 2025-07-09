import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MiApiService {
  constructor(private http: HttpClient) {}

  getDatos() {
    return this.http.get('https://statill-api.onrender.com/api/');
  }
getProductos() {
  console.log('Llamando a getProductos...');
  return this.http.get('https://statill-api.onrender.com/api/v1/products');
}

}
