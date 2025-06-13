import { Component } from '@angular/core';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';
import { CommonModule } from '@angular/common';
import { HeaderStatillComponent } from 'src/app/header-statill/header-statill.component';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [ComercioHeaderComponent, CommonModule, HeaderStatillComponent],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export class EstadisticasComponent {
  productos: any[] = [  /* esto esta copiado aca y en catalogo, deberiamos hacer que esten unificadas */
      { nombre: 'Producto 1', cantidad: 10, precio: 100 },
      { nombre: 'Producto 2', cantidad: 5, precio: 200 },
      { nombre: 'Producto 3', cantidad: 8, precio: 150 },
      { nombre: 'Producto 4', cantidad: 12, precio: 80 },
      { nombre: 'Producto 5', cantidad: 7, precio: 120 }
    ]
}
