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
  activeItem = 'home';

  menuItems = [
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
  ];

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  setActive(itemId: string) {
    this.activeItem = itemId;
  }
}