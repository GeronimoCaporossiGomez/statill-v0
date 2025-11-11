// src/app/pages/orden-confirmacion/orden-confirmacion.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../servicios/order.service';

@Component({
  selector: 'app-orden-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="confirmacion-container">
      <div class="confirmacion-card">
        <div class="success-icon">✅</div>
        <h1>¡Pedido Confirmado!</h1>
        
        <div *ngIf="order" class="order-details">
          <div class="detail-row">
            <span class="label">Número de Orden:</span>
            <span class="value">#{{ order.id }}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Estado:</span>
            <span class="status pending">{{ getStatusText(order.status) }}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Método de Pago:</span>
            <span class="value">💵 Efectivo</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Fecha:</span>
            <span class="value">{{ formatDate(order.created_at) }}</span>
          </div>
          
          <div class="products-section">
            <h3>Productos:</h3>
            <div *ngFor="let product of order.products" class="product-item">
              <span>{{ product.quantity }}x Producto #{{ product.product_id }}</span>
            </div>
          </div>
          
          <div class="info-box">
            <p><strong>📍 Dirección de retiro:</strong></p>
            <p>{{ storeName || 'Cargando...' }}</p>
            <p class="info-text">
              Presentá este número de orden al retirar tu pedido.
              El comercio te avisará cuando esté listo.
            </p>
          </div>
        </div>
        
        <div *ngIf="isLoading" class="loading">
          Cargando información del pedido...
        </div>
        
        <div *ngIf="errorMessage" class="error">
          {{ errorMessage }}
        </div>
        
        <div class="actions">
          <button class="btn-primary" [routerLink]="['/preordenes']">
            Ver Mis Pedidos
          </button>
          <button class="btn-secondary" [routerLink]="['/home']">
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmacion-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .confirmacion-card {
      background: white;
      border-radius: 24px;
      padding: 3rem;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    
    .success-icon {
      font-size: 5rem;
      margin-bottom: 1rem;
      animation: bounce 0.5s ease;
    }
    
    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    h1 {
      color: #4caf50;
      margin: 0 0 2rem 0;
      font-size: 2rem;
    }
    
    .order-details {
      text-align: left;
      margin-bottom: 2rem;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f0f0f0;
      
      .label {
        color: #666;
        font-weight: 500;
      }
      
      .value {
        font-weight: 600;
        color: #333;
      }
      
      .status {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 600;
        
        &.pending {
          background: #fff3cd;
          color: #856404;
        }
      }
    }
    
    .products-section {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      
      h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1.1rem;
        color: #333;
      }
      
      .product-item {
        padding: 0.5rem 0;
        color: #666;
      }
    }
    
    .info-box {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background: #e8f5e9;
      border-radius: 12px;
      border-left: 4px solid #4caf50;
      
      p {
        margin: 0.5rem 0;
        color: #2e7d32;
      }
      
      .info-text {
        font-size: 0.9rem;
        margin-top: 1rem;
      }
    }
    
    .loading, .error {
      padding: 2rem;
      text-align: center;
      color: #666;
    }
    
    .error {
      color: #d32f2f;
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .btn-primary, .btn-secondary {
      padding: 1rem;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: #4caf50;
      color: white;
      
      &:hover {
        background: #45a049;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
      }
    }
    
    .btn-secondary {
      background: #f5f5f5;
      color: #333;
      
      &:hover {
        background: #e0e0e0;
      }
    }
    
    @media (max-width: 768px) {
      .confirmacion-card {
        padding: 2rem 1.5rem;
      }
      
      .success-icon {
        font-size: 4rem;
      }
      
      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class OrdenConfirmacionComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  
  order: any = null;
  storeName: string = '';
  isLoading = false;
  errorMessage: string | null = null;
  
  ngOnInit() {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    
    if (!orderId) {
      this.errorMessage = 'No se encontró el ID de la orden';
      return;
    }
    
    this.loadOrder(Number(orderId));
  }
  
  loadOrder(orderId: number) {
    this.isLoading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (response) => {
        if (response.successful && response.data) {
          this.order = response.data;
          // Aquí podrías cargar el nombre de la tienda si lo necesitas
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar orden:', err);
        this.errorMessage = 'Error al cargar la información del pedido';
        this.isLoading = false;
      }
    });
  }
  
  getStatusText(status: string): string {
    const statusMap: any = {
      'pending': 'Pendiente',
      'accepted': 'Aceptado',
      'received': 'Recibido',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}