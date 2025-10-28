import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { latLng, tileLayer, MapOptions, Marker, marker, icon, Map, LeafletMouseEvent } from 'leaflet';
import * as L from 'leaflet';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { MiApiService } from '../servicios/mi-api.service';
import { GeocodingService } from '../servicios/geocoding.service';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [LeafletModule, CommonModule, FormsModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss'
})
export class MapaComponent {
  @Input() modo: 'vendedor' | 'comprador' = 'comprador';
  @Input() ubicacion: [number, number] | null = null;
  @Output() ubicacionSeleccionada = new EventEmitter<[number, number]>();
  @Output() direccionSeleccionada = new EventEmitter<string>();

  // Variables para el modo vendedor
  direccionInput: string = '';
  direccionActual: string = '';
  buscandoDireccion: boolean = false;

  options: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: 13,
    center: latLng(-34.6037, -58.3816)
  };

  map!: Map;
  leafletMarkers: Marker[] = [];
  marcadorVendedor: Marker | null = null;

  constructor(
    private api: MiApiService,
    private geocoding: GeocodingService
  ) {}

  onMapReady(map: Map) {
    this.map = map;

    if (this.modo === 'vendedor') {
      // Permitir click en el mapa para seleccionar ubicación
      this.map.on('click', (e: LeafletMouseEvent) => {
        this.seleccionarUbicacionEnMapa(e.latlng.lat, e.latlng.lng);
      });

      // Si ya hay una ubicación previa, mostrarla
      if (this.ubicacion) {
        this.seleccionarUbicacionEnMapa(this.ubicacion[0], this.ubicacion[1]);
      }
    } else {
      this.cargarTiendas();
    }
  }

  // Seleccionar ubicación haciendo click en el mapa
  seleccionarUbicacionEnMapa(lat: number, lng: number) {
    // Remover marcador anterior si existe
    if (this.marcadorVendedor) {
      this.map.removeLayer(this.marcadorVendedor);
    }

    // Crear nuevo marcador
    this.marcadorVendedor = marker([lat, lng], {
      icon: icon({
        iconUrl: 'assets/img/mapa-pin-statill.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })
    });

    this.marcadorVendedor.addTo(this.map);
    this.map.setView([lat, lng], 15);

    // Emitir coordenadas
    this.ubicacionSeleccionada.emit([lat, lng]);

    // Obtener dirección aproximada (geocoding inverso)
    this.obtenerDireccionDesdeCoordenadas(lat, lng);
  }

  // Buscar dirección y mostrarla en el mapa
  async buscarDireccion() {
    if (!this.direccionInput || this.direccionInput.trim() === '') {
      return;
    }

    this.buscandoDireccion = true;

    try {
      const coords = await this.geocoding.geocode(this.direccionInput).toPromise();

      if (coords && coords.lat && coords.lng) {
        // Validar coordenadas dentro de Argentina
        if (coords.lat < -55 || coords.lat > -21 || coords.lng < -73 || coords.lng > -53) {
          alert('La dirección no parece estar en Argentina. Por favor, verifica.');
          this.buscandoDireccion = false;
          return;
        }

        // Actualizar dirección actual
        this.direccionActual = this.direccionInput;

        // Mostrar en el mapa
        this.seleccionarUbicacionEnMapa(coords.lat, coords.lng);

        // Emitir dirección confirmada
        this.direccionSeleccionada.emit(this.direccionActual);

        console.log(`✅ Dirección encontrada: ${this.direccionActual} -> [${coords.lat}, ${coords.lng}]`);
      } else {
        alert('No se pudo encontrar la dirección. Intenta con otra.');
      }
    } catch (error) {
      console.error('Error al buscar dirección:', error);
      alert('Hubo un error al buscar la dirección. Intenta nuevamente.');
    }

    this.buscandoDireccion = false;
  }

  // Geocoding inverso (coordenadas -> dirección)
  async obtenerDireccionDesdeCoordenadas(lat: number, lng: number) {
    try {
      // Usar Nominatim para reverse geocoding
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.display_name) {
        this.direccionActual = data.display_name;
        this.direccionInput = data.display_name;
        this.direccionSeleccionada.emit(this.direccionActual);
        console.log(`📍 Dirección aproximada: ${this.direccionActual}`);
      }
    } catch (error) {
      console.error('Error en geocoding inverso:', error);
    }
  }

  async cargarTiendas() {
    console.log('🔍 Iniciando carga de tiendas...');

    this.api.getStores().subscribe(async (res: any) => {
      if (!res || !res.data || res.data.length === 0) {
        console.log('❌ No hay tiendas disponibles');
        return;
      }

      const stores = res.data;
      console.log(`📊 Total de tiendas: ${stores.length}`);

      // Filtrar tiendas con direcciones válidas
      const storesValidas = stores.filter((store: any) => {
        if (!store.address || store.address.trim() === '') {
          console.log(`⚠️ Tienda sin dirección: ${store.name}`);
          return false;
        }

        // Filtrar direcciones inválidas (solo símbolos raros)
        const direccionLimpia = store.address.trim();
        if (direccionLimpia.length < 5 || /^[^a-zA-Z0-9]+$/.test(direccionLimpia)) {
          console.log(`⚠️ Dirección inválida para ${store.name}: "${store.address}"`);
          return false;
        }

        return true;
      });

      console.log(`✅ Tiendas con direcciones válidas: ${storesValidas.length}`);

      // Geocodificar una por una
      for (let i = 0; i < storesValidas.length; i++) {
        const store = storesValidas[i];

        console.log(`\n🏪 ${i + 1}/${storesValidas.length} - ${store.name}`);
        console.log(`📍 Dirección: ${store.address}`);

        try {
          const coords = await this.geocoding.geocode(store.address).toPromise();

          if (coords && coords.lat && coords.lng) {
            // Validar que las coordenadas sean razonables (Argentina está aprox entre -55 y -21 lat, -73 y -53 lng)
            if (coords.lat < -55 || coords.lat > -21 || coords.lng < -73 || coords.lng > -53) {
              console.log(`❌ Coordenadas fuera de Argentina: [${coords.lat}, ${coords.lng}]`);
              continue;
            }

            console.log(`✅ Geocodificado: [${coords.lat}, ${coords.lng}]`);

            const newMarker = marker([coords.lat, coords.lng], {
              icon: icon({
                iconUrl: 'assets/img/mapa-pin-statill.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
              })
            }).bindPopup(`<b>${store.name}</b><br>${store.address}`);

            // Verificar que el marcador se agregue correctamente
            try {
              newMarker.addTo(this.map);
              this.leafletMarkers.push(newMarker);
              console.log(`📌 Marcador agregado. Total: ${this.leafletMarkers.length}`);
            } catch (err) {
              console.error(`💥 Error al agregar marcador:`, err);
            }
          } else {
            console.log(`❌ No se obtuvieron coordenadas válidas`);
          }
        } catch (error) {
          console.error(`💥 Error geocodificando:`, error);
        }

        // Esperar 1.2 segundos entre requests (un poco más para estar seguros)
        if (i < storesValidas.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      }

      console.log(`\n🏁 Finalizado. Marcadores en mapa: ${this.leafletMarkers.length}`);

      // Ajustar vista
      if (this.leafletMarkers.length > 0) {
        try {
          const coords = this.leafletMarkers.map(m => m.getLatLng());
          const bounds = L.latLngBounds(coords);
          this.map.fitBounds(bounds, { padding: [50, 50] });
          console.log(`🎉 Mapa ajustado con ${this.leafletMarkers.length} tiendas`);
        } catch (err) {
          console.error('Error ajustando bounds:', err);
        }
      } else {
        console.log('❌ No hay marcadores para mostrar');
      }
    });
  }
}