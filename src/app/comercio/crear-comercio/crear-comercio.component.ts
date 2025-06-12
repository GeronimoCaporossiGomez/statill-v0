import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-crear-comercio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crear-comercio.component.html',
  styleUrl: './crear-comercio.component.scss'
})
export class CrearComercioComponent {
  creando:boolean = false;

  creandoComercio() {
    this.creando = !this.creando;
  }
}
