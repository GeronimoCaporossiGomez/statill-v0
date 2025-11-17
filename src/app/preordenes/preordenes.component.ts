import { Component } from '@angular/core';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MiApiService } from '../servicios/mi-api.service';
import { forkJoin } from 'rxjs';

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

  constructor(private miApiService: MiApiService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
  this.miApiService.getMyOrders().subscribe({
    next: (data) => {
      const orders = data.data;

      console.log(data)
      const storeRequests = orders.map((order: any) =>
        this.miApiService.getStoreById(order.store_id)
      );

      forkJoin(storeRequests).subscribe((stores) => {
        const orderProductRequests = orders.map((order: any) => {

          // SAFETY: detect real structure
          const productList =
            order.products?.data ??
            order.products ??
            [];

          // If empty, return empty array so forkJoin works
          if (productList.length === 0) return [];

          const productRequests = productList.map((prod: any) =>
            this.miApiService.getProducto(prod.product_id)
          );

          return forkJoin(productRequests);
        });

        forkJoin(orderProductRequests).subscribe((allProducts) => {
          this.probando = orders.map((order: any, i: number) => {
            const productDetails = allProducts[i];

            const productList =
              order.products?.data ??
              order.products ??
              [];

            const productsFull = productList.map((prod: any, index: number) => ({
              id: prod.product_id,
              quantity: prod.quantity,
              name: productDetails[index]?.data?.name ?? "Producto desconocido",
            }));

            return {
              ...order,
              store: stores[i],
              productsFull,
            };
          });
        });
      });
    },
    error: (err) => console.error("Error loading orders:", err),
  });
}

  verDetalle(index: number) {
    this.descripcion = this.descripcion === index ? null : index;
  }
}
