import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../Componentes/sidebar-statill/sidebar.component";
import { RouterLink, RouterModule } from "@angular/router";
import { HeaderStatillComponent } from "../Componentes/header-statill/header-statill.component";
import { MiApiService, Point, PointsResponse, User, UsersResponse, Store, StoresResponse } from '../servicios/mi-api.service';
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
  
  constructor(private apiService: MiApiService) {}

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
    // Combinar puntos con datos de usuarios y tiendas
    this.puntosDisplay = this.puntos.map(punto => {
      // Buscar el usuario correspondiente
      const usuario = this.usuarios.find(user => user.id === punto.user_id);
      const nombreUsuario = usuario 
        ? `${usuario.first_names.trim()} ${usuario.last_name.trim()}` 
        : `Usuario #${punto.user_id}`;
      
      // Información adicional del usuario
      const rolUsuario = usuario?.store_role || '';
      const areaResidencia = usuario?.res_area || '';
      
      // Buscar la tienda correspondiente
      const tienda = this.tiendas.find(store => store.id === punto.store_id);
      const nombreTienda = tienda 
        ? tienda.name.trim()
        : `Tienda #${punto.store_id}`;
      
      // Información de la tienda
      const direccionTienda = tienda?.address || 'Dirección no disponible';
      const categoriaInfo = this.obtenerCategoria(tienda?.category);
      
      return {
        imagen: "assets/img/tienda.png", // Imagen por defecto
        nombre: nombreTienda,
        puntos: punto.amount,
        usuario: nombreUsuario,
        direccion: direccionTienda,
        categoria: categoriaInfo,
        rolUsuario: rolUsuario,
        areaResidencia: areaResidencia,
        id: punto.id,
        store_id: punto.store_id,
        user_id: punto.user_id
      };
    });
    
    // Ordenar por cantidad de puntos (mayor a menor)
    this.puntosDisplay.sort((a, b) => b.puntos - a.puntos);
    
    console.log('Datos combinados y ordenados:', this.puntosDisplay);
    console.log(`Total de puntos encontrados: ${this.puntosDisplay.length}`);
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
