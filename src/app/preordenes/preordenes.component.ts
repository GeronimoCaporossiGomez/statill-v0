import { Component } from '@angular/core';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-preordenes',
  standalone: true,
  imports: [HeaderStatillComponent, CommonModule, RouterLink],
  templateUrl: './preordenes.component.html',
  styleUrl: './preordenes.component.scss'
})
export class PreordenesComponent {

descripcion: number | null = null;;

probando: any[] = [{ /* esto hay que conectarlo con el backend. */
  imagen: "assets/img/tienda.png",
  nombre: "freddie verdury1",
  fecha: "20/10",
  hora: "12:30",
  descripcion: "2x Coca-Cola, 1x Pizza, 3x Hamburguesaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  pago: [
    { precioFinalAbonado: 48500,},
    { metodo: "Efectivo"},
    { propina: 100,},
  ]
},{ /* esto hay que conectarlo con el backend. */
  imagen: "assets/img/tienda.png",
  nombre: "freddie verdury1",
  fecha: "20/10",
  hora: "12:30",
  descripcion: "2x Coca-Cola, 1x Pizza, 3x holi",
  pago: [
    { precioFinalAbonado: 48500,},
    { metodo: "Efectivo"},
    { propina: 100,},
  ]
},{ /* esto hay que conectarlo con el backend. */
  imagen: "assets/img/tienda.png",
  nombre: "freddie verdury1",
  fecha: "20/10",
  hora: "12:30",
  descripcion: "2x Coca-Cola, 1x Pizza, 3x holi",
  pago: [
    { precioFinalAbonado: 48500,},
    { metodo: "Efectivo"},
    { propina: 100,},
  ]
},{ /* esto hay que conectarlo con el backend. */
  imagen: "assets/img/tienda.png",
  nombre: "freddie verdury1",
  fecha: "20/10",
  hora: "12:30",
  descripcion: "2x Coca-Cola, 1x Pizza, 3x holi",
  pago: [
    { precioFinalAbonado: 48500,},
    { metodo: "Efectivo"},
    { propina: 100,},
  ]
}]

verDetalle(index: number){
 this.descripcion = this.descripcion === index ? null : index;
}
}
