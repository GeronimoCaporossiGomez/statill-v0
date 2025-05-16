import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Resena {
  local: string;
  comentario: string;
  puntuacion: number;
  fecha: string;
}

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resenas.component.html',
  styleUrls: ['./resenas.component.scss']
})
export class ResenasComponent {
  resenas: Resena[] = [
    { local: 'Don Pan', comentario: 'Excelente atención y pan casero!', puntuacion: 5, fecha: '2025-05-01' },
    { local: 'Frutas La Huerta', comentario: 'Muy buenos precios.', puntuacion: 4, fecha: '2025-05-03' }
  ];

  nuevoLocal = '';
  nuevoComentario = '';
  nuevaPuntuacion: number | null = null;
  mensaje = '';

  enviarResena() {
    if (!this.nuevoLocal || !this.nuevoComentario || !this.nuevaPuntuacion) {
      this.mensaje = '⚠️ Completá todos los campos.';
      return;
    }

    this.resenas.unshift({
      local: this.nuevoLocal,
      comentario: this.nuevoComentario,
      puntuacion: this.nuevaPuntuacion,
      fecha: new Date().toISOString().split('T')[0]
    });

    this.nuevoLocal = '';
    this.nuevoComentario = '';
    this.nuevaPuntuacion = null;
    this.mensaje = '✅ Reseña publicada.';
  }
}
