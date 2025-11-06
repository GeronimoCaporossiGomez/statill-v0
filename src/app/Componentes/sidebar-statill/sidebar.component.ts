import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  isExpanded = false;
  activeItem = 'home'; // Item activo por defecto
  vendedor: boolean = true;

  menuItemsVendedor = [
    {
      path: '/catalogo',
      icon: 'assets/img/catalogo-noesPNG.png',
      text: 'Catálogo',
      id: 'catalogo'
    },
    {
      path: '/stock',
      icon: 'assets/img/Productos-icono.png',
      text: 'Productos',
      id: 'stock'
    },
    {
      path: '/estadisticas',
      icon: 'assets/img/Estadisticas-icono.png',
      text: 'Estadísticas',
      id: 'estadisticas'
    },
    {
      path: '/escanear',
      icon: 'assets/img/Escanear-icono.png',
      text: 'Escanear',
      id: 'escanear'
    },
    {
      path: '/configuracion',
      icon: 'assets/img/Configuracion-icono.png',
      text: 'Ajustes',
      id: 'configuracion'
    }
  ];

  menuItemsComprador = [
    {
      path: '/home',
      icon: 'assets/img/home-icono.png',
      text: 'Home',
      id: 'home'
    },
    {
      path: '/perfil',
      icon: 'assets/img/perfil-icono.png',
      text: 'Perfil',
      id: 'perfil'
    },
    {
      path: '/mapa',
      icon: 'assets/img/mapa-icono.png',
      text: 'Mapa',
      id: 'mapa'
    },
    {
      path: '/puntos',
      icon: 'assets/img/puntos-icono.png',
      text: 'Puntos(no manda a nada)',
      id: 'puntos'
    }
  ];

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  toggleVendedor() {
    this.vendedor = !this.vendedor;
  }

  setActive(itemId: string) {
    this.activeItem = itemId;
  }
}