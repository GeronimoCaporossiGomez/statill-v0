import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private apiUrl = 'https://statill-api.onrender.com/api';

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
}
