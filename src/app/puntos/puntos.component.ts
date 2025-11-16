import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../Componentes/sidebar-statill/sidebar.component';
import { RouterLink, RouterModule } from '@angular/router';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { MiApiService, Store } from '../servicios/mi-api.service';
import { AuthService } from '../servicios/auth.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-puntos',
  imports: [CommonModule, RouterLink, RouterModule, HeaderStatillComponent],
  templateUrl: './puntos.component.html',
  styleUrl: './puntos.component.scss',
})
export class PuntosComponent implements OnInit {
  puntosDisplay: Array<{
    imagen: string;
    nombre: string;
    puntos: number;
    direccion: string;
    categoria: string;
    store_id: number;
  }> = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private apiService: MiApiService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.obtenerPuntos();
  }

  obtenerPuntos(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.puntosDisplay = [];

    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.id) {
      this.errorMessage = 'Iniciá sesión para ver tus puntos acumulados.';
      this.isLoading = false;
      return;
    }

    this.apiService.getStores().subscribe({
      next: (storeResponse) => {
        if (!storeResponse.successful || !Array.isArray(storeResponse.data)) {
          this.errorMessage = 'No pudimos obtener las tiendas disponibles.';
          this.isLoading = false;
          return;
        }

        const tiendas: Store[] = storeResponse.data;

        if (tiendas.length === 0) {
          this.isLoading = false;
          this.errorMessage = 'Todavía no hay tiendas cargadas.';
          return;
        }

        const requests = tiendas.map((store) =>
          this.apiService.getMyPointsInStore(store.id).pipe(
            map((response: any) => ({
              store,
              puntos:
                response && typeof response.data === 'number'
                  ? response.data
                  : Number(response?.data?.points ?? 0),
            })),
          ),
        );

        if (requests.length === 0) {
          this.isLoading = false;
          return;
        }

        forkJoin(requests).subscribe({
          next: (results) => {
            this.puntosDisplay = results
              .filter((result) => result.puntos > 0)
              .map((result) => ({
                imagen: 'assets/img/tienda.png',
                nombre:
                  result.store.name?.trim() || `Tienda #${result.store.id}`,
                puntos: result.puntos,
                direccion: result.store.address || 'Dirección no disponible',
                categoria: this.obtenerCategoria(result.store.category),
                store_id: result.store.id,
              }))
              .sort((a, b) => b.puntos - a.puntos);

            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error al obtener puntos por tienda:', error);
            this.errorMessage =
              'No pudimos recuperar tus puntos. Intentá nuevamente más tarde.';
            this.isLoading = false;
          },
        });
      },
      error: (error) => {
        console.error('Error al obtener tiendas:', error);
        this.errorMessage =
          'No pudimos conectarnos para obtener las tiendas. Reintentá en unos minutos.';
        this.isLoading = false;
      },
    });
  }

  private obtenerCategoria(categoria: number | undefined | null): string {
    switch (categoria) {
      case 0:
        return 'Restaurante';
      case 1:
        return 'Kiosco';
      case 2:
        return 'Supermercado';
      case 3:
        return 'Panadería';
      default:
        return 'Sin categoría';
    }
  }
}
