import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nueva-promocion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-promocion.component.html',
  styleUrls: ['./nueva-promocion.component.scss']
})
export class NuevaPromocionComponent {
  titulo = '';
  descripcion = '';
  descuento: number | null = null;
  soloSuscriptores = false;
  mensaje = '';

  crearPromocion() {
    if (!this.titulo || !this.descripcion || !this.descuento) {
      this.mensaje = '⚠️ Completá todos los campos requeridos.';
      return;
    }

    const promo = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      descuento: this.descuento,
      soloSuscriptores: this.soloSuscriptores
    };

    console.log('🎁 Promoción creada:', promo);
    this.mensaje = '✅ Promoción guardada correctamente.';

    this.titulo = '';
    this.descripcion = '';
    this.descuento = null;
    this.soloSuscriptores = false;
  }
}
