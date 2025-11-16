import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  isExpanded = true; // Cambiado a true para mostrar por defecto
  activeItem = 'home'; // Item activo por defecto
  vendedor = false; // Cambiado a false para mostrar modo comprador por defecto

  menuItemsVendedor = [
    {
      path: '/menu-local',
      icon: 'assets/img/menu-icono.png',
      text: 'Menú',
      id: 'menu-local',
    },
    {
      path: '/ventas-locales',
      icon: 'assets/img/estrella.png',
      text: 'Ventas',
      id: 'ventas-locales',
    },
    {
      path: '/catalogo',
      icon: 'assets/img/catalogo-noesPNG.png',
      text: 'Catálogo',
      id: 'catalogo',
    },
    {
      path: '/stock',
      icon: 'assets/img/Productos-icono.png',
      text: 'Productos',
      id: 'stock',
    },
    {
      path: '/estadisticas',
      icon: 'assets/img/Estadisticas-icono.png',
      text: 'Estadísticas',
      id: 'estadisticas',
    },
    {
      path: '/escanear',
      icon: 'assets/img/Escanear-icono.png',
      text: 'Escanear',
      id: 'escanear',
    },
    {
      path: '/configuracion',
      icon: 'assets/img/Configuracion-icono.png',
      text: 'Ajustes',
      id: 'configuracion',
    },
  ];

  menuItemsComprador = [
    {
      path: '/home',
      icon: 'assets/img/home-statill.png',
      text: 'Home',
      id: 'home',
    },
    {
      path: '/perfil',
      icon: 'assets/img/perfil-statill.png',
      text: 'Perfil',
      id: 'perfil',
    },
    {
      path: '/mapa',
      icon: 'assets/img/mapa-pin-statill.png',
      text: 'Mapa',
      id: 'mapa',
    },
    {
      path: '/puntos',
      icon: 'assets/img/puntos-statill.png',
      text: 'Puntos',
      id: 'puntos',
    },
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

  get currentMenuItems() {
    return this.vendedor ? this.menuItemsVendedor : this.menuItemsComprador;
  }

  get toggleLabel() {
    return this.vendedor ? 'Comprador' : 'Vendedor';
  }

  get toggleAlt() {
    return this.vendedor ? 'Cambiar a Comprador' : 'Cambiar a Vendedor';
  }

  get toggleIcon() {
    return 'assets/img/vendedor-statill.png';
  }
}