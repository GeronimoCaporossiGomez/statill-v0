import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para la respuesta de puntos
export interface Point {
  id: number;
  store_id: number;
  user_id: number;
  amount: number;
}

export interface PointsResponse {
  successful: boolean;
  data: Point[];
  message: string;
}

// Interfaces para usuarios
export interface User {
  first_names: string;
  last_name: string;
  email: string;
  password: string;
  birthdate: string;
  gender: string;
  res_area: string;
  id: number;
  store_id: number;
  store_role: string;
}

export interface UsersResponse {
  successful: boolean;
  data: User[];
  message: string;
}

// Interfaces para productos
export interface Product {
  id: number;
  store_id: number;
  name: string;
  brand: string;
  price: number;
  points_price: number | null;
  type: number;
  quantity: number;
  desc: string;
  hidden: boolean;
  barcode: string;
}

export interface ProductsResponse {
  successful: boolean;
  data: Product[];
  message: string;
}

// Interfaces para tiendas
export interface Store {
  id: number;
  name: string;
  address: string;
  category: number;
  preorder_enabled: boolean;
  ps_value: number;
  opening_times: (string | null)[];
  closing_times: (string | null)[];
  payment_methods: boolean[];
}

export interface StoresResponse {
  successful: boolean;
  data: Store[];
  message: string;
}

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
  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(this.apiUrl + '/api/v1/users/');
  }
  getStores(): Observable<StoresResponse> {
    return this.http.get<StoresResponse>(this.apiUrl + '/api/v1/stores/');
  }
  postStores(tienda: any) {
    return this.http.post(this.apiUrl + '/api/v1/stores/', tienda);
  }
  getProductosById(storeId: number) {
    return this.http.get(this.apiUrl + '/api/v1/products/?store_id=' + storeId);
  }
  getProductsByBarcode(barcode: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(this.apiUrl + '/api/v1/products/?barcode=' + barcode);
  }
  getSales() {
    return this.http.get(this.apiUrl + '/api/v1/sales/');
  }
  postSales(sale: any) {
    return this.http.post(this.apiUrl + '/api/v1/sales/', sale);
  }
  getPoints(): Observable<PointsResponse> {
    return this.http.get<PointsResponse>(this.apiUrl + '/api/v1/points/');
  }
}


