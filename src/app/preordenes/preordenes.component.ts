import { Component } from '@angular/core';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-preordenes',
  standalone: true,
  imports: [HeaderStatillComponent, CommonModule, RouterLink],
  templateUrl: './preordenes.component.html',
  styleUrl: './preordenes.component.scss',
})
export class PreordenesComponent {
  descripcion: number | null = null;

  probando: any[] = [
    {
      /* esto hay que conectarlo con el backend. */
      imagen: 'assets/img/tienda.png',
      nombre: 'Nombre de Tienda',
      fecha: '11/12',
      hora: '17:45',
      descripcion:
        '2x Coca-Cola, 1x Pizza, 3x Hamburguesaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      pago: [
        { precioFinalAbonado: 48500 },
        { metodo: 'Efectivo' },
        { propina: 100 },
      ],
    },
    {
      /* esto hay que conectarlo con el backend. */
      imagen: 'assets/img/tienda.png',
      nombre: 'Nombre de Tienda',
      fecha: '8/9',
      hora: '12:30',
      descripcion: '2x Coca-Cola, 1x Pizza, 3x papa',
      pago: [
        { precioFinalAbonado: 48500 },
        { metodo: 'Efectivo' },
        { propina: 100 },
      ],
    },
    {
      /* esto hay que conectarlo con el backend. */
      imagen: 'assets/img/tienda.png',
      nombre: 'Nombre de Tienda',
      fecha: '1/2',
      hora: '9:25',
      descripcion: '2x Coca-Cola, 1x Pizza, 3x Adios',
      pago: [
        { precioFinalAbonado: 48500 },
        { metodo: 'Efectivo' },
        { propina: 100 },
      ],
    },
    {
      /* esto hay que conectarlo con el backend. */
      imagen: 'assets/img/tienda.png',
      nombre: 'Nombre de restaurante',
      fecha: '20/10',
      hora: '10:30',
      descripcion: '2x Coca-Cola, 1x Pizza, 4x Hamburguesa',
      pago: [
        { precioFinalAbonado: 48500 },
        { metodo: 'Efectivo' },
        { propina: 100 },
      ],
    },
  ];

  verDetalle(index: number) {
    this.descripcion = this.descripcion === index ? null : index;
  }
}
