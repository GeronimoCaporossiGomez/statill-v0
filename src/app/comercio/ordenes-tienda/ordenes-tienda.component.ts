// src/app/comercio/ordenes-tienda/ordenes-tienda.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../servicios/order.service';
import { MiApiService } from '../../servicios/mi-api.service';
import { SidebarComponent } from '../../Componentes/sidebar-statill/sidebar.component';
import { forkJoin } from 'rxjs';

interface OrderWithProducts extends Order {
  productDetails?: any[];
  userName?: string;
}

@Component({
  selector: 'app-ordenes-tienda',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <app-sidebar></app-sidebar>
    
    <div class="ordenes-container">
      <h1>📦 Gestión de Pedidos</h1>
      
      <!-- Filtros -->
      <div class="filters">
        <button 
          *ngFor="let status of statusFilters" 
          class="filter-btn"
          [class.active]="selectedStatus === status.value"
          (click)="filterByStatus(status.value)">
          {{ status.icon }} {{ status.label }} ({{ getCountByStatus(status.value) }})
        </button>
      </div>
      
      <!-- Loading -->
      <div *ngIf="isLoading" class="loading">
        Cargando pedidos...
      </div>
      
      <!-- Error -->
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <!-- Órdenes -->
      <div *ngIf="!isLoading && filteredOrders.length === 0" class="no-orders">
        <p>No hay pedidos {{ selectedStatus !== 'all' ? 'con este estado' : '' }}</p>
      </div>
      
      <div class="orders-grid">
        <div *ngFor="let order of filteredOrders" class="order-card" [class]="order.status">
          <div class="order-header">
            <div class="order-number">
              <strong>Pedido #{{ order.id }}</strong>
              <span class="status-badge" [class]="order.status">
                {{ getStatusText(order.status) }}
              </span>
            </div>
            <div class="order-date">{{ formatDate(order.created_at) }}</div>
          </div>
          
          <div class="order-body">
            <div class="order-info">
              <p><strong>Cliente:</strong> {{ order.userName || 'Usuario #' + order.user_id }}</p>
              <p><strong>Método de Pago:</strong> {{ getPaymentMethod(order.payment_method) }}</p>
              <p><strong>Productos:</strong> {{ order.products.length }} item(s)</p>
            </div>
            
            <!-- Productos -->
            <div class="products-list">
              <div *ngFor="let product of order.productDetails" class="product-item">
                <span>{{ product.quantity }}x {{ product.name }}</span>
                <span class="product-price">\${{ product.price * product.quantity }}</span>
              </div>
            </div>
            
            <div class="order-total">
              <strong>Total: \${{ calculateOrderTotal(order) }}</strong>
            </div>
          </div>
          
          <div class="order-actions">
            <!-- Botones según estado -->
            <button 
              *ngIf="order.status === 'pending'" 
              class="btn-accept"
              (click)="updateStatus(order)"
              [disabled]="processingOrderId === order.id">
              {{ processingOrderId === order.id ? 'Procesando...' : '✓ Aceptar Pedido' }}
            </button>
            
            <button 
              *ngIf="order.status === 'accepted'" 
              class="btn-complete"
              (click)="updateStatus(order)"
              [disabled]="processingOrderId === order.id">
              {{ processingOrderId === order.id ? 'Procesando...' : '✓ Marcar como Entregado' }}
            </button>
            
            <button 
              *ngIf="order.status === 'pending' || order.status === 'accepted'"
              class="btn-cancel"
              (click)="cancelOrder(order)"
              [disabled]="processingOrderId === order.id">
              ✗ Cancelar
            </button>
            
            <span *ngIf="order.status === 'received'" class="completed-badge">
              ✓ Pedido completado
            </span>
            
            <span *ngIf="order.status === 'cancelled'" class="cancelled-badge">
              ✗ Pedido cancelado
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ordenes-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
      background: #f5f5f5;
      
      h1 {
        font-size: 2rem;
        margin-bottom: 2rem;
        color: #333;
      }
    }
    
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      
      .filter-btn {
        padding: 0.75rem 1.5rem;
        border: 2px solid #ddd;
        background: white;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #4caf50;
          background: #f1f8f4;
        }
        
        &.active {
          border-color: #4caf50;
          background: #4caf50;
          color: white;
        }
      }
    }
    
    .loading, .no-orders {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 12px;
      color: #666;
    }
    
    .error-message {
      padding: 1rem;
      background: #fff5f5;
      border: 2px solid #ff4444;
      border-radius: 8px;
      color: #d32f2f;
      margin-bottom: 1rem;
    }
    
    .orders-grid {
      display: grid;
      gap: 1.5rem;
    }
    
    .order-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid #ddd;
      
      &.pending { border-left-color: #ff9800; }
      &.accepted { border-left-color: #2196f3; }
      &.received { border-left-color: #4caf50; }
      &.cancelled { border-left-color: #f44336; }
    }
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f0f0f0;
      
      .order-number {
        display: flex;
        align-items: center;
        gap: 1rem;
        
        strong {
          font-size: 1.2rem;
          color: #333;
        }
      }
      
      .order-date {
        color: #666;
        font-size: 0.9rem;
      }
    }
    
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      
      &.pending { background: #fff3cd; color: #856404; }
      &.accepted { background: #cfe2ff; color: #084298; }
      &.received { background: #d1e7dd; color: #0f5132; }
      &.cancelled { background: #f8d7da; color: #842029; }
    }
    
    .order-body {
      margin-bottom: 1rem;
      
      .order-info {
        margin-bottom: 1rem;
        
        p {
          margin: 0.5rem 0;
          color: #666;
        }
      }
    }
    
    .products-list {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      
      .product-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        color: #333;
        
        .product-price {
          font-weight: 600;
          color: #2e7d32;
        }
      }
    }
    
    .order-total {
      text-align: right;
      font-size: 1.2rem;
      color: #2e7d32;
    }
    
    .order-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      
      button {
        flex: 1;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 150px;
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
      
      .btn-accept {
        background: #4caf50;
        color: white;
        
        &:hover:not(:disabled) {
          background: #45a049;
          transform: translateY(-2px);
        }
      }
      
      .btn-complete {
        background: #2196f3;
        color: white;
        
        &:hover:not(:disabled) {
          background: #0b7dda;
          transform: translateY(-2px);
        }
      }
      
      .btn-cancel {
        background: #f44336;
        color: white;
        
        &:hover:not(:disabled) {
          background: #da190b;
          transform: translateY(-2px);
        }
      }
      
      .completed-badge, .cancelled-badge {
        flex: 1;
        text-align: center;
        padding: 0.75rem;
        border-radius: 8px;
        font-weight: 600;
      }
      
      .completed-badge {
        background: #d1e7dd;
        color: #0f5132;
      }
      
      .cancelled-badge {
        background: #f8d7da;
        color: #842029;
      }
    }
    
    @media (max-width: 768px) {
      .ordenes-container {
        padding: 1rem;
      }
      
      .order-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      
      .order-actions {
        flex-direction: column;
        
        button {
          min-width: 100%;
        }
      }
    }
  `]
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
    // Cargar detalles de productos para cada orden
    this.orders.forEach(order => {
      order.productDetails = order.products.map(p => {
        // Por ahora retornamos info básica, deberías hacer una llamada al API
        return {
          quantity: p.quantity,
          name: `Producto #${p.product_id}`,
          price: 0
        };
      });
    });
  }
  
  filterByStatus(status: string) {
    this.selectedStatus = status;
    if (status === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(o => o.status === status);
    }
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
        console.log('✅ Estado actualizado');
        this.processingOrderId = null;
        this.loadOrders(); // Recargar órdenes
      },
      error: (err) => {
        console.error('❌ Error al actualizar estado:', err);
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
        console.log('✅ Pedido cancelado');
        this.processingOrderId = null;
        this.loadOrders();
      },
      error: (err) => {
        console.error('❌ Error al cancelar:', err);
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
    const methods = ['💵 Efectivo', '💳 Débito', '💳 Crédito', '📱 Transferencia'];
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