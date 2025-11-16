import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { MiApiService } from './mi-api.service';

@Injectable({
  providedIn: 'root',
})
export class ComercioService {
  private miApiService = inject(MiApiService);

  getStores(): Observable<any[]> {
    return this.miApiService
      .getStores()
      .pipe(map((response: any) => response.data));
  }

  getStoreById(id: number): Observable<any> {
    return this.miApiService
      .getStoreById(id)
      .pipe(map((response: any) => response.data));
  }

  getProductos(): Observable<any[]> {
    return this.miApiService
      .getProductos()
      .pipe(map((response: any) => response.data));
  }

  // Para páginas públicas (negocio): filtra en el cliente para asegurar resultados correctos
  getProductosByStore(storeId: number): Observable<any[]> {
    return this.miApiService
      .getProductos()
      .pipe(
        map((response: any) =>
          response.data.filter((p: any) => p.store_id === storeId),
        ),
      );
  }

  // Para el dashboard del owner (stock): usa el endpoint del backend directamente
  getMyStoreProducts(storeId: number): Observable<any[]> {
    return this.miApiService
      .getProductosById(storeId)
      .pipe(map((response: any) => response.data));
  }

  postSales(sale: any): Observable<any> {
    return this.miApiService.postSales(sale);
  }

  postReview(review: any): Observable<any> {
    return this.miApiService.postReviews(review);
  }

  deleteReview(reviewId: any) {
    return this.miApiService.deleteReviews(Number(reviewId));
  }

  getSales(): Observable<any[]> {
    return this.miApiService
      .getSales()
      .pipe(map((response: any) => response.data));
  }

  getReviews(): Observable<any[]> {
    return this.miApiService
      .getReviews()
      .pipe(map((response: any) => response.data));
  }

  getReviewsByStore(storeId: number): Observable<any[]> {
    return this.miApiService
      .getReviewsByStoreId(storeId)
      .pipe(map((response: any) => response.data));
  }

  getMyOrders(): Observable<any> {
    return this.miApiService
      .getMyOrders()
      .pipe(map((response: any) => response.data));
  }

  getMyPointsInStore(storeId: number): Observable<any> {
    return this.miApiService
      .getMyPointsInStore(storeId)
      .pipe(map((response: any) => response.data));
  }
}
