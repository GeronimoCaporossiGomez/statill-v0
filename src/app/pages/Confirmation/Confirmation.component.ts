import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../servicios/order.service';

@Component({
  selector: 'app-orden-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './Confirmation.component.html',
  styleUrls: ['./Confirmation.component.scss']
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
          this.loadStoreName(this.order.store_id);
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
  
  loadStoreName(storeId: number) {
    this.storeName = `Tienda #${storeId}`;
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
