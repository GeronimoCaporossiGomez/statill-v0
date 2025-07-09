import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';
import { MiApiService } from 'src/app/servicios/mi-api.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, ComercioHeaderComponent, HeaderStatillComponent],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})
export class EstadisticasComponent implements OnInit {

  productos: { name: string; quantity: number; price: number }[] = [];

  constructor(private miApi: MiApiService) {}
ngOnInit(): void {
  console.log('Iniciando carga de productos...');
  this.miApi.getProductos().subscribe({
    next: (res: any) => {
      console.log('Respuesta API:', res);
      if (res.successful && Array.isArray(res.data)) {
        this.productos = res.data.map((p: any) => ({
          name: p.name,
          quantity: p.quantity,
          price: p.price
        }));
      } else {
        this.productos = [];
      }
    },
    error: (err) => {
      console.error('Error al obtener productos', err);
      this.productos = [];
    }
  });
}

}
