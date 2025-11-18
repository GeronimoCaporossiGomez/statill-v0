import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../servicios/order.service';
import { MiApiService } from '../../servicios/mi-api.service';

@Component({
  selector: 'app-orden-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Confirmation.component.html',
  styleUrls: ['./Confirmation.component.scss'],
})
export class OrdenConfirmacionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private miApiService = inject(MiApiService);

  order: Order | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  orderId!: number;
  paymentContext: 'cash' | 'qr' | null = null;
  storeName = '';
  storeAddress = '';

  ngOnInit() {
    this.orderId = Number(this.route.snapshot.queryParamMap.get('orderId'));
    const payment = this.route.snapshot.queryParamMap.get('payment');
    this.paymentContext =
      payment === 'qr' || payment === 'cash' ? payment : null;

    if (!this.orderId) {
      this.errorMessage = 'ID de orden no encontrado';
      return;
    }

    this.loadOrder();
  }

  loadOrder() {
    this.isLoading = true;
    this.errorMessage = null;

    this.orderService.getMyOrderById(this.orderId).subscribe({
      next: (order) => {
        this.isLoading = false;

        if (!order) {
          this.errorMessage = 'No se encontró la orden';
          return;
        }

        console.log('order.created_at:', order.created_at);
        this.order = order;
        this.storeName = '';
        this.storeAddress = '';

        if (order.store_id) {
          this.loadStore(order.store_id);
        }
      },
      error: (error) => {
        console.error('Error al obtener la orden', error);
        this.errorMessage =
          'No pudimos cargar tu orden. Intentá nuevamente en unos segundos.';
        this.isLoading = false;
      },
    });
  }

  getStatusText(status: string): string {
    const map: any = {
      pending: 'Pendiente',
      accepted: 'Aceptada',
      received: 'Entregada',
      cancelled: 'Cancelada',
    };
    return map[status] || status;
  }

  getPaymentMethod(method: number): string {
    const methods = ['💵 Efectivo', '💳 Débito', '💳 Crédito', '📱 QR'];
    return methods[method] || 'Desconocido';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';
    let date: Date;
    // If only time is provided, prepend today's date
    if (/^\d{2}:\d{2}:\d{2}/.test(dateString)) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      date = new Date(`${yyyy}-${mm}-${dd}T${dateString}`);
    } else {
      date = new Date(dateString);
    }
    if (isNaN(date.getTime())) return 'Fecha no disponible';
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  goTo(path: string) {
    this.router.navigate(['/', path]);
  }

  volver() {
    this.router.navigate(['/']);
  }

  private loadStore(storeId: number) {
    this.setStoreFallback(storeId);

    this.miApiService.getStoreById(storeId).subscribe({
      next: (response: any) => {
        const storeData = response?.data ?? response;

        if (!storeData) {
          this.setStoreFallback(storeId);
          return;
        }

        this.storeName = storeData.name?.trim() || `Tienda #${storeId}`;
        this.storeAddress = storeData.address || 'Dirección no disponible';
      },
      error: (error) => {
        console.warn('No se pudo obtener la tienda de la orden', error);
        this.setStoreFallback(storeId);
      },
    });
  }

  private setStoreFallback(storeId: number) {
    this.storeName = this.storeName || `Tienda #${storeId}`;
    this.storeAddress = this.storeAddress || 'Dirección no disponible';
  }
}
