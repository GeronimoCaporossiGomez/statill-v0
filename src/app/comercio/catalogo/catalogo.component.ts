import { Component, OnInit } from '@angular/core';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';
import { CommonModule } from '@angular/common';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';
import { FormsModule } from '@angular/forms';
import { MiApiService } from 'src/app/servicios/mi-api.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ComercioHeaderComponent, CommonModule, HeaderStatillComponent, FormsModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent {
  constructor(private miApi: MiApiService) {}
  productos: any[] = []
  ngOnInit() {
    this.miApi.getDatos().subscribe((data: any) => {
      console.log('prubeba, prubea', data);
      this.productos = data.data;
      console.log('Productos desde la API:', this.productos);
    });
  }

  scioli: string = ''
  cantidad: number = 0
  precio: number = 0
  agregarProducto() {
    const nuevoProducto = { nombre: this.scioli, cantidad: this.cantidad, precio: this.precio };
    this.productos.push(nuevoProducto);
  }
  //crear el service para pasar el array desde catalogo hasta estadisticas
}

