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
        console.log(data.data)
        // Create 1 request per order
        const storeRequests = orders.map((order: any) =>
          this.miApiService.getStoreById(order.store_id)
        );
  
        // Run all requests in parallel
        forkJoin(storeRequests).subscribe((stores) => {
          // Attach store to its order
          this.probando = orders.map((order: any, i: number) => ({
            ...order,
            store: stores[i]   // <--- store info here
          }));
        });
      },
      error: (err) => {
        console.error("Error loading orders:", err);
      }
    });
  }


  verDetalle(index: number) {
    this.descripcion = this.descripcion === index ? null : index;
  }
}
