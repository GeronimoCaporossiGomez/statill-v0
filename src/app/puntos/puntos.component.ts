import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../Componentes/sidebar-statill/sidebar.component";
import { RouterLink, RouterModule } from "@angular/router";
import { HeaderStatillComponent } from "../Componentes/header-statill/header-statill.component";
import { MiApiService, Point, PointsResponse, User, UsersResponse, Store, StoresResponse } from '../servicios/mi-api.service';
import { AuthService } from '../servicios/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-puntos',
  imports: [CommonModule, RouterLink, RouterModule, HeaderStatillComponent],
  templateUrl: './puntos.component.html',
  styleUrl: './puntos.component.scss'
})
export class PuntosComponent implements OnInit {

  // Datos reales del backend
  puntos: Point[] = [];
  usuarios: User[] = [];
  tiendas: Store[] = [];
  
  // Interfaz para mostrar en el template
  puntosDisplay: any[] = [];
  
  // Variable para mostrar estado de carga
  isLoading: boolean = true;
  
  constructor(
    private apiService: MiApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obtenerPuntos();
  }

  obtenerPuntos(): void {
    this.isLoading = true;
    
    // Hacer llamadas paralelas a los 3 endpoints
    forkJoin({
      puntos: this.apiService.getPoints(),
      usuarios: this.apiService.getUsers(),
      tiendas: this.apiService.getStores()
    }).subscribe({
      next: (responses) => {
        console.log('Respuestas recibidas:', responses);
        
        // Verificar que todas las respuestas sean exitosas
        if (responses.puntos.successful && responses.puntos.data) {
          this.puntos = responses.puntos.data;
        }
        
        if (responses.usuarios.successful && responses.usuarios.data) {
          this.usuarios = responses.usuarios.data;
        }
        
        if (responses.tiendas.successful && responses.tiendas.data) {
          this.tiendas = responses.tiendas.data;
        }
        
        // Combinar los datos
        this.combinarDatos();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener datos:', error);
        this.isLoading = false;
        // En caso de error, usar datos de ejemplo
        this.cargarDatosEjemplo();
      }
    });
  }

  private combinarDatos(): void {
    // Obtener el usuario autenticado
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      console.warn('No hay usuario autenticado');
      this.puntosDisplay = [];
      return;
    }

    // Filtrar solo los puntos del usuario autenticado
    const puntosUsuario = this.puntos.filter(punto => punto.user_id === currentUser.id);
    
    if (puntosUsuario.length === 0) {
      console.log('El usuario no tiene puntos en ninguna tienda');
      this.puntosDisplay = [];
      return;
    }

    // Agrupar puntos por tienda (sumar los puntos de cada tienda)
    const puntosPorTienda: { [storeId: number]: number } = {};
    
    puntosUsuario.forEach(punto => {
      if (puntosPorTienda[punto.store_id]) {
        puntosPorTienda[punto.store_id] += punto.amount;
      } else {
        puntosPorTienda[punto.store_id] = punto.amount;
      }
    });

    // Crear el array de puntos display agrupados por tienda
    this.puntosDisplay = Object.keys(puntosPorTienda).map(storeIdStr => {
      const storeId = Number(storeIdStr);
      const totalPuntos = puntosPorTienda[storeId];
      
      // Buscar la tienda correspondiente
      const tienda = this.tiendas.find(store => store.id === storeId);
      const nombreTienda = tienda 
        ? tienda.name.trim()
        : `Tienda #${storeId}`;
      
      // Información de la tienda
      const direccionTienda = tienda?.address || 'Dirección no disponible';
      const categoriaInfo = this.obtenerCategoria(tienda?.category);
      
      return {
        imagen: "assets/img/tienda.png", // Imagen por defecto
        nombre: nombreTienda,
        puntos: totalPuntos,
        direccion: direccionTienda,
        categoria: categoriaInfo,
        store_id: storeId
      };
    });
    
    // Ordenar por cantidad de puntos (mayor a menor)
    this.puntosDisplay.sort((a, b) => b.puntos - a.puntos);
    
    console.log('Puntos del usuario agrupados por tienda:', this.puntosDisplay);
    console.log(`Total de tiendas con puntos: ${this.puntosDisplay.length}`);
  }

  private obtenerCategoria(categoria: number | undefined): string {
    switch (categoria) {
      case 0: return 'Restaurante';
      case 1: return 'Kiosco';
      case 2: return 'Supermercado';
      case 3: return 'Panadería';
      default: return 'Sin categoría';
    }
  }

  private cargarDatosEjemplo(): void {
    // Datos de fallback en caso de error
    this.puntosDisplay = [{
      imagen: "assets/img/tienda.png",
      nombre: "Nombre restaurante",
      puntos: 1200,
    },
    {
      imagen: "assets/img/tienda.png",
      nombre: "Nombre tienda",
      puntos: 1400,
    },
    {
      imagen: "assets/img/tienda.png",
      nombre: "Nombre restaurante",
      puntos: 1600,
    }];
  }

}
