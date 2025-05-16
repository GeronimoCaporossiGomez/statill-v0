import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.scss']
})
export class CrearProductoComponent {
  nombre = '';
  precio: number | null = null;
  categoria = '';
  stock = 0;
  descripcion = '';
  imagenUrl = '';
  mensaje = '';

  guardarProducto() {
    if (!this.nombre || !this.precio || !this.categoria || this.stock < 0) {
      this.mensaje = '⚠️ Completá todos los campos obligatorios.';
      return;
    }

    const nuevoProducto = {
      nombre: this.nombre,
      precio: this.precio,
      categoria: this.categoria,
      stock: this.stock,
      descripcion: this.descripcion,
      imagenUrl: this.imagenUrl
    };

    console.log('📦 Producto guardado:', nuevoProducto);
    this.mensaje = '✅ Producto creado exitosamente.';

    // Limpiar campos
    this.nombre = '';
    this.precio = null;
    this.categoria = '';
    this.stock = 0;
    this.descripcion = '';
    this.imagenUrl = '';
  }
}
