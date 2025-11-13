import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/servicios/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);

  isExpanded = false;
  activeItem = 'home';
  vendedor = false;
  isOwnerOrCashier = false;

  menuItemsVendedor = [
    { path: '/catalogo', icon: 'assets/img/catalogo-noesPNG.png', text: 'Catálogo', id: 'catalogo' },
    { path: '/stock', icon: 'assets/img/Productos-icono.png', text: 'Productos', id: 'stock' },
    { path: '/estadisticas', icon: 'assets/img/Estadisticas-icono.png', text: 'Estadísticas', id: 'estadisticas' },
    { path: '/escanear', icon: 'assets/img/Escanear-icono.png', text: 'Escanear', id: 'escanear' },
    { path: '/configuracion', icon: 'assets/img/Configuracion-icono.png', text: 'Ajustes', id: 'configuracion' },
    { path: '/menu-local', icon: 'assets/img/Productos-icono.png', text: 'Menu Local', id: 'Menu' },
  ];

  menuItemsComprador = [
    { path: '/home', icon: 'assets/img/home-statill.png', text: 'Home', id: 'home' },
    { path: '/perfil', icon: 'assets/img/perfil-statill.png', text: 'Perfil', id: 'perfil' },
    { path: '/mapa', icon: 'assets/img/mapa-pin-statill.png', text: 'Mapa', id: 'mapa' },
    { path: '/puntos', icon: 'assets/img/puntos-statill.png', text: 'Puntos', id: 'puntos' },
  ];

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    console.log('👤 Usuario detectado en sidebar:', user);

    if (user && (user.store_role === 'owner' || user.store_role === 'cashier')) {
      this.isOwnerOrCashier = true;
      console.log('✅ Es owner o cashier, puede cambiar de vista');
    } else {
      console.log('🚫 No es owner ni cashier, no puede cambiar de vista');
    }
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleVendedor(): void {
    if (this.isOwnerOrCashier) {
      this.vendedor = !this.vendedor;
    }
  }

  setActive(itemId: string): void {
    this.activeItem = itemId;
  }
}
