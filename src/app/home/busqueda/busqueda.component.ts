import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoresComponent } from 'src/app/Componentes/Stores-Statill/Stores.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule, StoresComponent],
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.scss']
})
export class HomeComponent implements OnInit {
  searchTerm = '';

  carrito: any[] = [];

  ngOnInit() {}

  agregarAlCarrito(producto: any) {
    const itemExistente = this.carrito.find(item => item.nombre === producto.nombre);
    if (itemExistente) {
      itemExistente.cantidad = (itemExistente.cantidad || 1) + 1;
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
  }
}
