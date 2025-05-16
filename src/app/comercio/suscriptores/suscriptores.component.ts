import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-suscriptores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suscriptores.component.html',
  styleUrls: ['./suscriptores.component.scss']
})
export class SuscriptoresComponent {
  suscriptores = [
    { nombre: 'Ana Pérez', correo: 'ana@mail.com', puntos: 230 },
    { nombre: 'Carlos Ruiz', correo: 'carlos@mail.com', puntos: 120 },
    { nombre: 'Valeria Díaz', correo: 'valeria@mail.com', puntos: 310 }
  ];
}
