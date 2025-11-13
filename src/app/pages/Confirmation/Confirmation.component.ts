import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../servicios/order.service';

@Component({
  selector: 'app-orden-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Confirmation.component.html',
  styleUrls: ['./Confirmation.component.scss']
})
export class OrdenConfirmacionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  order: Order | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  orderId!: number;

  ngOnInit() {
    this.orderId = Number(this.route.snapshot.queryParamMap.get('orderId'));
    if (!this.orderId) {
      this.errorMessage = 'ID de orden no encontrado';
      return;
    }

    this.loadOrder();
  }

  loadOrder() {
    this.isLoading = true;
    this.errorMessage = null;

    // 🔄 Usar endpoint permitido: /api/v1/orders/my
    this.orderService.getMyOrders().subscribe({
      next: (response) => {
        if (response.successful && response.data) {
          const found = response.data.find(o => o.id === this.orderId);
          if (found) {
            this.order = found;
          } else {
            this.errorMessage = 'No se encontró la orden';
          }
        } else {
          this.errorMessage = 'Error al obtener las órdenes';
        }
        this.isLoading = false;
      },
    });
  }

  getStatusText(status: string): string {
    const map: any = {
      'pending': 'Pendiente',
      'accepted': 'Aceptada',
      'received': 'Entregada',
      'cancelled': 'Cancelada'
    };
    return map[status] || status;
  }

  getPaymentMethod(method: number): string {
    const methods = ['💵 Efectivo', '💳 Débito', '💳 Crédito', '📱 QR'];
    return methods[method] || 'Desconocido';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  volver() {
    this.router.navigate(['/']);
  }
}
