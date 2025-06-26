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

  menuItems = [
    { 
      path: '/home', 
      icon: 'fas fa-home', 
      text: 'Home', 
      id: 'home' 
    },
    { 
      path: '/productos', 
      icon: 'fas fa-box-open', 
      text: 'Productos', 
      id: 'productos' 
    },
    { 
      path: '/perfil', 
      icon: 'fas fa-user-circle', 
      text: 'Cuenta', 
      id: 'perfil' 
    },
    { 
      path: '/estadisticas', 
      icon: 'fas fa-chart-bar', 
      text: 'Estadísticas', 
      id: 'estadisticas' 
    },
    { 
      path: '/local', 
      icon: 'fas fa-store-alt', 
      text: 'Mi Local', 
      id: 'local' 
    }
  ];

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  setActive(itemId: string) {
    this.activeItem = itemId;
  }
}