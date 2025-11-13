// src/app/comercio/ordenes-tienda/ordenes-tienda.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../servicios/order.service';
import { MiApiService } from '../../servicios/mi-api.service';
import { SidebarComponent } from '../../Componentes/sidebar-statill/sidebar.component';

interface OrderWithProducts extends Order {
  productDetails?: any[];
  userName?: string;
}

@Component({
  selector: 'app-ordenes-tienda',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './ordenes-tienda.component.html',
  styleUrls: ['./ordenes-tienda.component.scss']
})
export class OrdenesTiendaComponent implements OnInit {
  private orderService = inject(OrderService);
  private apiService = inject(MiApiService);
  
  orders: OrderWithProducts[] = [];
  filteredOrders: OrderWithProducts[] = [];
  selectedStatus: string = 'all';
  isLoading = false;
  errorMessage: string | null = null;
  processingOrderId: number | null = null;
  
  statusFilters = [
    { value: 'all', label: 'Todos', icon: '📦' },
    { value: 'pending', label: 'Pendientes', icon: '⏳' },
    { value: 'accepted', label: 'Aceptados', icon: '✓' },
    { value: 'received', label: 'Entregados', icon: '🎉' },
    { value: 'cancelled', label: 'Cancelados', icon: '✗' }
  ];
  
  ngOnInit() {
    this.loadOrders();
  }
  
  loadOrders() {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.orderService.getMyStoreOrders().subscribe({
      next: (response) => {
        if (response.successful && response.data) {
          this.orders = response.data;
          this.loadProductDetails();
          this.filterByStatus(this.selectedStatus);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar órdenes:', err);
        this.errorMessage = 'Error al cargar los pedidos';
        this.isLoading = false;
      }
    });
  }
  
  loadProductDetails() {
    this.orders.forEach(order => {
      order.productDetails = order.products.map(p => ({
        quantity: p.quantity,
        name: `Producto #${p.product_id}`,
        price: 0
      }));
    });
  }
  
  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.filteredOrders = 
      status === 'all' ? [...this.orders] : this.orders.filter(o => o.status === status);
  }
  
  getCountByStatus(status: string): number {
    if (status === 'all') return this.orders.length;
    return this.orders.filter(o => o.status === status).length;
  }
  
  updateStatus(order: Order) {
    if (this.processingOrderId) return;
    
    this.processingOrderId = order.id;
    this.errorMessage = null;
    
    this.orderService.updateOrderStatus(order.id).subscribe({
      next: () => {
        this.processingOrderId = null;
        this.loadOrders();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        this.errorMessage = 'Error al actualizar el estado del pedido';
        this.processingOrderId = null;
      }
    });
  }
  
  cancelOrder(order: Order) {
    if (this.processingOrderId) return;
    
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return;
    
    this.processingOrderId = order.id;
    this.errorMessage = null;
    
    this.orderService.cancelOrder(order.id).subscribe({
      next: () => {
        this.processingOrderId = null;
        this.loadOrders();
      },
      error: (err) => {
        console.error('Error al cancelar:', err);
        this.errorMessage = 'Error al cancelar el pedido';
        this.processingOrderId = null;
      }
    });
  }
  
  calculateOrderTotal(order: OrderWithProducts): number {
    if (!order.productDetails) return 0;
    return order.productDetails.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  }
  
  getStatusText(status: string): string {
    const map: any = {
      'pending': 'Pendiente',
      'accepted': 'Aceptado',
      'received': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return map[status] || status;
  }
  
  getPaymentMethod(method: number): string {
    const methods = ['💵 Efectivo', '💳 Débito', '💳 Crédito', '📱 QR'];
    return methods[method] || 'Desconocido';
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
