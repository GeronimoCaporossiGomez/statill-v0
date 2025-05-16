import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-puntos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './puntos.component.html',
  styleUrls: ['./puntos.component.scss']
})
export class PuntosComponent {
  puntos = 560;
  nivel = 'Bronce';
  historial = [
    { motivo: 'Compra en Don Pan', puntos: 100, fecha: '2025-05-01' },
    { motivo: 'Reseña a local', puntos: 20, fecha: '2025-05-02' },
    { motivo: 'Promoción canjeada', puntos: -50, fecha: '2025-05-03' }
  ];
}
