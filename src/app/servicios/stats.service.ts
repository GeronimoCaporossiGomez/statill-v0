import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private apiUrl = 'https://statill-api.onrender.com/api/v1';

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getProductsStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`);
  }

  // Obtener todas las tiendas
  getStoresStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stores`);
  }

  // Obtener todas las ventas
  getSalesStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sales`);
  }

  // Obtener todas las ventas filtradas por producto y fechas
  getSalesByProduct(
    productId: string,
    startDate?: string,
    endDate?: string,
  ): Observable<any> {
    let params = new HttpParams().set('product_id', productId.toString());

    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get(`${this.apiUrl}/sales`, { params });
  }

  // Obtener todos los usuarios
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  // Añadir una nueva venta
  addSale(sale: {
    user_id: number;
    store_id: number;
    payment_method: number;
    products: { product_id: number; quantity: number }[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/sales`, sale);
  }
}
