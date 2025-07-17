import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule,],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  isExpanded = false;
  activeItem = 'home'; // Item activo por defecto
  vendedor: boolean = false
  menuItemsVendedor = [
    {
      path: '/estadisticas',
      icon: 'fas fa-chart-bar',
      text: 'Estadísticas',
      id: 'estadisticas'
    },
    {
      path: '/escanear',
      icon: 'fas fa-barcode',
      text: 'Escanear',
      id: 'escanear'
    },
    {
      path: '/catalogo',
      icon: 'fas fa-clipboard-list',
      text: 'Catálogo',
      id: 'catalogo'
    },
    {
      path: '/configuracion',
      icon: 'fas fa-cog',
      text: 'Ajustes',
      id: 'configuracion'
    },
    {
      path: '/stock',
      icon: 'fas fa-store-alt',
      text: 'Productos',
      id: 'stock'
    }
  ]
    menuItemsComprador = [
      {
        path: '/home',
        icon: 'fas fa-home',
        text: 'Home',
        id: 'home'
      },
      {
        path: '/perfil',
        icon: 'fas fa-profile',
        text: 'Perfil',
        id: 'perfil'
      },
      {
        path: '/mapa',
        icon: 'fas fa-map',
        text: 'Mapa',
        id: 'mapa'
      },
      {
        path: '/puntos',
        icon: 'fas fa-points',
        text: 'Puntos(no manda a nada)',
        id: 'puntos'
      },
  ]

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  toggleVendedor(){
    this.vendedor = !this.vendedor
  }

  setActive(itemId: string) {
    this.activeItem = itemId;
  }
}