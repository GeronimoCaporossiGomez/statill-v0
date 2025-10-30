import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { MiApiService } from './mi-api.service';

@Injectable({
  providedIn: 'root'
})
export class ComercioService {
  private miApiService = inject(MiApiService);

  getStores(): Observable<any[]> {
    return this.miApiService.getStores()
      .pipe(map((response: any) => response.data));
  }

  getStoreById(id: number): Observable<any> {
    return this.getStores().pipe(
      map(stores => stores.find((s: any) => s.id === id))
    );
  }

  getProductos(): Observable<any[]> {
    return this.miApiService.getProductos()
      .pipe(map((response: any) => response.data));
  }

  getProductosByStore(storeId: number): Observable<any[]> {
    return this.getProductos().pipe(
      map(productos => productos.filter((p: any) => p.store_id === storeId))
    );
  }

  postSales(sale: any): Observable<any> {
    return this.miApiService.postSales(sale);
  }

  postReview(review: any): Observable<any> {
    return this.miApiService.postReviews(review);
  }

  getSales(): Observable<any[]> {
    return this.miApiService.getSales()
      .pipe(map((response: any) => response.data));
  }

  getReviews(): Observable<any[]> {
    return this.miApiService.getSales()
      .pipe(map((response: any) => response.data));
  }

  getReviewsByStore(storeId: number): Observable<any[]> {
    return this.getReviews().pipe(
      map(productos => productos.filter((p: any) => p.store_id === storeId))
    );
  }
}