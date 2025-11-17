import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces para la respuesta de puntos
export interface Point {
  id: number;
  store_id: number;
  user_id: number;
  amount: number;
}

export interface Discount {
  id: number;
  product_id: number;
  pct_off: number;
  start_date: string;
  end_date: string;
  days_usable: (string | null)[];
  min_amount: number;
  max_amount: number;
}

export interface PointsResponse {
  successful: boolean;
  data: Point[];
  message: string;
}

export interface DiscountsResponse {
  successful: boolean;
  data: Discount[];
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

export interface GeocodeAddressResponse {
  data: {
    latitude: number;
    longitude: number;
    formatted_address: string;
  };
  message: string;
  successful: boolean;
}

export interface ReverseGeocodingResponse {
  data: { address: string };
  message: string;
  successful: boolean;
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

// Interfaces para reseñas

export interface Review {
  id: number;
  store_id: number;
  user_id: number;
  stars: number;
  desc: string;
}

export interface ReviewsResponse {
  successful: boolean;
  data: Review[];
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
  imageUrl?: string;
}

export interface StoresResponse {
  successful: boolean;
  data: Store[];
  message: string;
}

export interface CloudinaryUploadResponse {
  successful: boolean;
  data: {
    public_id: string;
    url: string;
    format: string;
  };
  message: string;
}

export interface GetCloudinaryURLResponse {
  successful: boolean;
  data: string; //la url es data
  message: string;
}

@Injectable({ providedIn: 'root' })
export class MiApiService {
  constructor(private http: HttpClient) {}
  private apiUrl = 'https://statill-api.onrender.com';
  getProductos() {
    return this.http.get(this.apiUrl + '/api/v1/products/');
  }

  getProducto(productId: number) {
    return this.http.get(this.apiUrl + '/api/v1/products/' + productId);
  }

  crearProducto(producto: any) {
    return this.http.post(this.apiUrl + '/api/v1/products/', producto);
  }
  editarProducto(id: number, producto: any) {
    return this.http.put(
      this.apiUrl + '/api/v1/products/' + id + '/',
      producto,
    );
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
    return this.http.get(this.apiUrl + '/api/v1/products/store/' + storeId);
  }
  getProductsByBarcode(barcode: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(
      this.apiUrl + '/api/v1/products/?barcode=' + barcode,
    );
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
  getReviews(): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(this.apiUrl + '/api/v1/reviews/');
  }

  getDiscounts(): Observable<DiscountsResponse> {
    return this.http.get<DiscountsResponse>(this.apiUrl + '/api/v1/discounts/');
  }

  getStoreById(id: number): Observable<any> {
    return this.http.get(this.apiUrl + '/api/v1/stores/' + id);
  }

  getReviewsByStoreId(storeId: number): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(
      this.apiUrl + '/api/v1/reviews/store/' + storeId,
    );
  }
  postReviews(review: any) {
    return this.http.post(this.apiUrl + '/api/v1/reviews/', review);
  }
  deleteReviews(id: number): Observable<any> {
    return this.http.delete(this.apiUrl + '/api/v1/reviews/' + id);
  }

  // Orders endpoints
  getMyOrders(): Observable<any> {
    return this.http.get(this.apiUrl + '/api/v1/orders/my');
  }

  getMyPointsInStore(storeId: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/api/v1/points/my/store/${storeId}`)
      .pipe(
        catchError(() => {
          // If the API call fails or status is not 200, return the fallback value
          return of({ data: 0 });
        }),
      );
  }

  // geo
  geocodeAddress(address: string): Observable<GeocodeAddressResponse> {
    return this.http.get<GeocodeAddressResponse>(
      this.apiUrl + '/api/v1/geo/geocode?address=' + address,
    );
  }

  reverseGeocode(
    latitude: number,
    longitude: number,
  ): Observable<ReverseGeocodingResponse> {
    return this.http.get<ReverseGeocodingResponse>(
      this.apiUrl +
        `/api/v1/geo/geocode/reverse?latitude=${latitude}&longitude=${longitude}`,
    );
  }
  uploadImage(
    t: 'store' | 'user' | 'product',
    id: number,
    file: File,
  ): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<CloudinaryUploadResponse>(
      this.apiUrl + `/api/v1/images/upload?t=${t}&id=${id}`,
      formData,
    );
  }

  getImageByObjectId(
    t: 'user' | 'store' | 'product',
    id: number,
  ): Observable<GetCloudinaryURLResponse> {
    return this.http.get<GetCloudinaryURLResponse>(
      this.apiUrl + `/api/v1/images/id/object?t=${t}&id=${id}`,
    );
  }

  getImageByCloudinaryId(
    cloudinary_public_id: string,
  ): Observable<GetCloudinaryURLResponse> {
    return this.http.get<GetCloudinaryURLResponse>(
      this.apiUrl + `/api/v1/images/cloudinary/${cloudinary_public_id}`,
    );
  }
}
