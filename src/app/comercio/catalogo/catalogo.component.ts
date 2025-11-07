import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MiApiService } from 'src/app/servicios/mi-api.service';
@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent {
  constructor(private miApi: MiApiService) {}
  productos: any[] = [];
  productosCatalogoIds: number[] = [];

  ngOnInit() {
    this.miApi.getProductos().subscribe((data: any) => {
      this.productos = data.data;
    });
  }

  selectedProductoId: number | null = null;

  agregarProducto() {
    if (this.selectedProductoId === null) return;
    if (!this.productosCatalogoIds.includes(this.selectedProductoId)) {
      this.productosCatalogoIds.push(this.selectedProductoId);
    }
    this.selectedProductoId = null;
  }

  get productosCatalogo() {
    return this.productos.filter((p) =>
      this.productosCatalogoIds.includes(p.id),
    );
  }
}
