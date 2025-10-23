import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MiApiService {
  constructor(private http: HttpClient) {}
  private apiUrl = 'https://statill-api.onrender.com';
  getProductos() {
    return this.http.get(this.apiUrl + '/api/v1/products/');
  }
  crearProducto(producto: any) {
    return this.http.post(this.apiUrl + '/api/v1/products/', producto);
  }
  editarProducto(id: number, producto: any) {
    return this.http.put(this.apiUrl + '/api/v1/products/' + id + '/', producto);
  }
  getUsers() {
    return this.http.get(this.apiUrl + '/api/v1/users/');
  }
  getStores() {
    return this.http.get(this.apiUrl + '/api/v1/stores/');
  }
  postStores(tienda: any) {
    return this.http.post(this.apiUrl + '/api/v1/stores/', tienda);
  }
  getProductosById(storeId: number) {
    return this.http.get(this.apiUrl + '/api/v1/products/?store_id=' + storeId);
  }
  getSales() {
    return this.http.get(this.apiUrl + '/api/v1/sales/');
  }
  postSales(sale: any) {
    return this.http.post(this.apiUrl + '/api/v1/sales/', sale);
  }
}


