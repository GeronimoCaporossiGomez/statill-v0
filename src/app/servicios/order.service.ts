import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderProduct {
  product_id: number;
  quantity: number;
}

export interface CreateOrderRequest {
  store_id: number;
  products: OrderProduct[];
  payment_method: number; // 0: Efectivo, 1: Débito, 2: Crédito, 3: Transferencia
}

export interface Order {
  id: number;
  user_id: number;
  store_id: number;
  created_at: string;
  status: 'pending' | 'accepted' | 'received' | 'cancelled';
  received_at: string | null;
  payment_method: number;
  products: OrderProduct[];
}

export interface OrderResponse {
  successful: boolean;
  data: Order;
  message: string;
}

export interface OrdersResponse {
  successful: boolean;
  data: Order[];
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://statill-api.onrender.com/api/v1';

  constructor(private http: HttpClient) {}

  // Crear orden
  createOrder(order: CreateOrderRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/`, order);
  }

  // Obtener mis órdenes (como usuario)
  getMyOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.apiUrl}/orders/my`);
  }

  // ✅ Obtener una orden propia por ID (sin permisos de admin)
  getMyOrderById(id: number): Observable<Order | null> {
    return new Observable(observer => {
      this.getMyOrders().subscribe({
        next: (response) => {
          if (response.successful && response.data) {
            const found = response.data.find(o => o.id === id) || null;
            observer.next(found);
            observer.complete();
          } else {
            observer.error('Error al obtener mis órdenes');
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }

  // Obtener órdenes de mi tienda (como owner/cashier)
  getMyStoreOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.apiUrl}/orders/my/store`);
  }

  // ❌ (Solo admins) Obtener orden por ID
  getOrderById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/orders/${id}`);
  }

  // Actualizar estado de orden (para owner/cashier)
  updateOrderStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/orders/${id}/status`, {});
  }

  // Cancelar orden (para usuario)
  cancelOrder(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/orders/${id}/cancel`, {});
  }

  // Obtener productos de una orden
  getOrderProducts(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${id}/products`);
  }
}
