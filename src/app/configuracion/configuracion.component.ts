import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { Router } from '@angular/router';
import { ComercioService } from '../servicios/comercio.service';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, HeaderStatillComponent],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss'],
})
export class ConfiguracionComponent implements OnInit {
  private router = inject(Router);
  private comercioService = inject(ComercioService);
  private authService = inject(AuthService);

  comercios: any[] = [];
  cargando = true;
  user: any = null;
  fullName: string = '';
  email: string = '';

  ngOnInit() {
    // Obtener usuario actual
    this.user = this.authService.getCurrentUser();

    if (this.user) {
      this.fullName = `${this.user.first_names} ${this.user.last_name}`;
      this.email = this.user.email;
    } else {
      // Si no hay usuario en cache, intentar obtenerlo
      this.authService.fetchCurrentUser().subscribe({
        next: () => {
          this.user = this.authService.getCurrentUser();
          if (this.user) {
            this.fullName = `${this.user.first_names} ${this.user.last_name}`;
            this.email = this.user.email;
          }
        },
      });
    }

    // Cargar tiendas del usuario si es owner
    if (this.user && this.user.store_id) {
      this.comercioService.getStores().subscribe({
        next: (stores) => {
          // Filtrar solo las tiendas del usuario
          this.comercios = stores.filter(
            (store: any) => store.id === this.user.store_id,
          );
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar tiendas:', err);
          this.cargando = false;
        },
      });
    } else {
      // Si no es owner, cargar todas las tiendas (o mostrar mensaje)
      this.comercioService.getStores().subscribe({
        next: (stores) => {
          this.comercios = stores;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar tiendas:', err);
          this.cargando = false;
        },
      });
    }
  }

  irAComercio(id: number) {
    this.router.navigate(['/negocio', id]);
  }
}
