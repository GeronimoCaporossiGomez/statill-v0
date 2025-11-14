import { Component } from '@angular/core';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MiApiService } from '../servicios/mi-api.service';

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
        this.probando = data;
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
