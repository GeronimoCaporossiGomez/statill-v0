import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class GeneralService {
  constructor(private http: HttpClient) {}
  private readonly apiUrl = 'https://statill-api.onrender.com';
  crearProducto(producto: any) {
    return this.http.post(this.apiUrl + '/api/v1/products/', producto);
  }
  editarProducto(id: number, producto: any) {
    return this.http.put(
      this.apiUrl + '/api/v1/products/' + id + '/',
      producto,
    );
  }
  getProductos() {
    console.log('Llamando a getProductos...');
    return this.http.get('https://statill-api.onrender.com/api/v1/products');
  }
  getUsers() {
    return this.http.get(this.apiUrl + '/api/v1/users/');
  }

  getUserFirstNames(id: number) {
    return this.http.get(this.apiUrl + `/api/v1/users/${id}/name/`);
  }
}
