import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  latLng,
  tileLayer,
  MapOptions,
  Marker,
  marker,
  icon,
  Map,
  LeafletMouseEvent,
} from 'leaflet';
import * as L from 'leaflet';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { MiApiService } from '../servicios/mi-api.service';
import { GeocodingService } from '../servicios/geocoding.service';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [LeafletModule, CommonModule, FormsModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss',
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
        attribution: '&copy; OpenStreetMap contributors',
      }),
    ],
    zoom: 13,
    center: latLng(-34.6037, -58.3816),
  };

  map!: Map;
  leafletMarkers: Marker[] = [];
  marcadorVendedor: Marker | null = null;

  constructor(
    private api: MiApiService,
    private geocoding: GeocodingService,
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
  seleccionarUbicacionEnMapa(latitude: number, longitude: number) {
    // Remover marcador anterior si existe
    if (this.marcadorVendedor) {
      this.map.removeLayer(this.marcadorVendedor);
    }

    // Crear nuevo marcador
    this.marcadorVendedor = marker([latitude, longitude], {
      icon: icon({
        iconUrl: 'assets/img/mapa-pin-statill.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    });

    this.marcadorVendedor.addTo(this.map);
    this.map.setView([latitude, longitude], 15);

    // Emitir coordenadas
    this.ubicacionSeleccionada.emit([latitude, longitude]);

    // Obtener dirección aproximada (geocoding inverso)
    this.obtenerDireccionDesdeCoordenadas(latitude, longitude);
  }

  // Buscar dirección y mostrarla en el mapa
  async buscarDireccion() {
    if (!this.direccionInput || this.direccionInput.trim() === '') {
      return;
    }

    this.buscandoDireccion = true;

    try {
      const coords = await this.geocoding
        .geocode(this.direccionInput)
        .toPromise();
      console.log('Debug coords:', coords);

      if (coords && coords.latitude && coords.longitude) {
        // Validar coordenadas dentro de Argentina
        if (
          coords.latitude < -55 ||
          coords.latitude > -21 ||
          coords.longitude < -73 ||
          coords.longitude > -53
        ) {
          alert(
            'La dirección no parece estar en Argentina. Por favor, verifica.',
          );
          this.buscandoDireccion = false;
          return;
        }

        // Actualizar dirección actual
        this.direccionActual = this.direccionInput;

        // Mostrar en el mapa
        this.seleccionarUbicacionEnMapa(coords.latitude, coords.longitude);

        // Emitir dirección confirmada
        this.direccionSeleccionada.emit(this.direccionActual);

        console.log(
          `✅ Dirección encontrada: ${this.direccionActual} -> [${coords.latitude}, ${coords.longitude}]`,
        );
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
  async obtenerDireccionDesdeCoordenadas(latitude: number, longitude: number) {
    try {
      const data = await this.geocoding
        .reverseGeocode(latitude, longitude)
        .toPromise();

      if (data) {
        this.direccionActual = data.address;
        this.direccionInput = data.address;
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

      for (let i = 0; i < stores.length; i++) {
        const store = stores[i];
        const coords = { latitude: store.latitude, longitude: store.longitude };
        const newMarker = marker([coords.latitude, coords.longitude], {
          icon: icon({
            iconUrl: 'assets/img/mapa-pin-statill.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
        }).bindPopup(`<b>${store.name}</b><br>${store.address}`);
        try {
          newMarker.addTo(this.map);
          this.leafletMarkers.push(newMarker);
          console.log(
            `📌 Marcador agregado. Total: ${this.leafletMarkers.length}`,
          );
        } catch (err) {
          console.error(`💥 Error al agregar marcador:`, err);
        }

        // const store = storesValidas[i];

        // console.log(`\n🏪 ${i + 1}/${storesValidas.length} - ${store.name}`);
        // console.log(`📍 Dirección: ${store.address}`);

        // try {
        //   const coords = await this.geocoding
        //     .geocode(store.address)
        //     .toPromise();

        //   if (coords && coords.latitude && coords.longitude) {
        //     // Validar que las coordenadas sean razonables (Argentina está aprox entre -55 y -21 latitude, -73 y -53 longitude)
        //     if (
        //       coords.latitude < -55 ||
        //       coords.latitude > -21 ||
        //       coords.longitude < -73 ||
        //       coords.longitude > -53
        //     ) {
        //       console.log(
        //         `❌ Coordenadas fuera de Argentina: [${coords.latitude}, ${coords.longitude}]`,
        //       );
        //       continue;
        //     }

        //     console.log(`✅ Geocodificado: [${coords.latitude}, ${coords.longitude}]`);

        //     const newMarker = marker([coords.latitude, coords.longitude], {
        //       icon: icon({
        //         iconUrl: 'assets/img/mapa-pin-statill.png',
        //         iconSize: [32, 32],
        //         iconAnchor: [16, 32],
        //       }),
        //     }).bindPopup(`<b>${store.name}</b><br>${store.address}`);

        //     // Verificar que el marcador se agregue correctamente
        //     try {
        //       newMarker.addTo(this.map);
        //       this.leafletMarkers.push(newMarker);
        //       console.log(
        //         `📌 Marcador agregado. Total: ${this.leafletMarkers.length}`,
        //       );
        //     } catch (err) {
        //       console.error(`💥 Error al agregar marcador:`, err);
        //     }
        //   } else {
        //     console.log(`❌ No se obtuvieron coordenadas válidas`);
        //   }
        // } catch (error) {
        //   console.error(`💥 Error geocodificando:`, error);
        // }

        // // Esperar 1.2 segundos entre requests (un poco más para estar seguros)
        // if (i < storesValidas.length - 1) {
        //   await new Promise((resolve) => setTimeout(resolve, 1200));
        // }
      }

      console.log(
        `\n🏁 Finalizado. Marcadores en mapa: ${this.leafletMarkers.length}`,
      );

      // Ajustar vista
      if (this.leafletMarkers.length > 0) {
        try {
          const coords = this.leafletMarkers.map((m) => m.getLatLng());
          const bounds = L.latLngBounds(coords);
          this.map.fitBounds(bounds, { padding: [50, 50] });
          console.log(
            `🎉 Mapa ajustado con ${this.leafletMarkers.length} tiendas`,
          );
        } catch (err) {
          console.error('Error ajustando bounds:', err);
        }
      } else {
        console.log('❌ No hay marcadores para mostrar');
      }
    });
  }
}
