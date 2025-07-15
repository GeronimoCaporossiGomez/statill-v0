import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private apiUrl = 'https://statill-api.onrender.com/api/v1';

  constructor(private http: HttpClient) {}

  getProductsStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`);
  }

  getStoresStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stores`);
  }

  getSalesStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sales`);
  }

  getSalesByProduct(
    productId: string,
    startDate?: string,
    endDate?: string
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
}
