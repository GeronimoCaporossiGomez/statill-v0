import { Component } from '@angular/core';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MiApiService } from '../servicios/mi-api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-preordenes',
  standalone: true,
  imports: [HeaderStatillComponent, CommonModule, RouterLink],
  templateUrl: './preordenes.component.html',
  styleUrl: './preordenes.component.scss',
})
export class PreordenesComponent {
  descripcion: number | null = null;
  probando: any[] = [];

  constructor(private miApiService: MiApiService) { }

  ngOnInit() {
    this.loadOrders();
  }

  onImgError(event: any) {
    event.target.src = '/assets/img/tienda.png';
  }

  loadOrders() {
    this.miApiService.getMyOrders().subscribe({
      next: (data) => {
        const orders = data.data.filter((order: any) => {
          const status = order.status?.toUpperCase();
          return status !== 'RECEIVED' && status !== 'CANCELLED';
        });

        // Load store details
        const storeRequests = orders.map((order: any) =>
          this.miApiService.getStoreById(order.store_id)
        );

        forkJoin(storeRequests).subscribe((stores) => {
          // Load product details
          const orderProductRequests = orders.map((order: any) => {
            const productList = order.products?.data ?? order.products ?? [];

            if (productList.length === 0) return of([]); // return empty array as observable

            const productRequests = productList.map((prod: any) =>
              this.miApiService.getProducto(prod.product_id).pipe(
                catchError(() => of({ data: { name: 'Producto desconocido' } }))
              )
            );

            return forkJoin(productRequests);
          });

          forkJoin(orderProductRequests).subscribe((allProducts) => {
            // Load store images individually
            const imageRequests = orders.map((order: any) =>
              this.miApiService.getImageByObjectId('store', order.store_id).pipe(
                catchError(() => of({ data: '' })) // return empty string
              )
            );

            forkJoin(imageRequests).subscribe((images) => {
              this.probando = orders.map((order: any, i: number) => {
                const productDetails = allProducts[i];
                const productList = order.products?.data ?? order.products ?? [];

                const productsFull = productList.map((prod: any, index: number) => ({
                  id: prod.product_id,
                  quantity: prod.quantity,
                  name: productDetails[index]?.data?.name ?? 'Producto desconocido',
                }));

                const imagen = images[i]?.data && typeof images[i].data === 'string' && images[i].data.length > 0 ? images[i].data : '/assets/img/logo.png';

                return {
                  ...order,
                  store: stores[i],
                  productsFull,
                  imagen,
                  created_at_iso: '1970-01-01T' + order.created_at,
                };
              });
            });
          });
        });
      },
      error: (err) => console.error('Error loading orders:', err),
    });
  }

  verDetalle(index: number) {
    this.descripcion = this.descripcion === index ? null : index;
  }
}