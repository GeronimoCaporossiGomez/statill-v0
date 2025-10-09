import { Component, Input, Output, EventEmitter } from '@angular/core';
import { latLng, tileLayer, MapOptions, Marker, marker, icon, Map, LeafletMouseEvent } from 'leaflet';
import { MiApiService } from '../servicios/mi-api.service';
import { LeafletDirective, LeafletModule } from '@bluehalo/ngx-leaflet';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss'
})
export class MapaComponent {
  @Input() modo: 'vendedor' | 'comprador' = 'comprador';
  @Input() ubicacion: [number, number] | null = null;
  @Output() ubicacionSeleccionada = new EventEmitter<[number, number]>();

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

  constructor(private api: MiApiService) {}

  onMapReady(map: Map) {
    this.map = map;
    if (this.modo === 'vendedor') {
      this.map.on('click', (e: LeafletMouseEvent) => {
        const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
        this.leafletMarkers = [
          marker(latlng, {
            icon: icon({
              iconUrl: 'assets/img/mapa-pin-statill.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32]
            })
          })
        ];
        this.ubicacionSeleccionada.emit(latlng);
      });
      if (this.ubicacion) {
        this.leafletMarkers = [
          marker(this.ubicacion, {
            icon: icon({
              iconUrl: 'assets/img/mapa-pin-statill.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32]
            })
          })
        ];
        this.map.setView(this.ubicacion, 15);
      }
    } else {
      this.api.getStores().subscribe((res: any) => {
        if (res && res.data) {
          this.leafletMarkers = res.data.filter((store: any) => store.lat && store.lng).map((store: any) =>
            marker([store.lat, store.lng], {
              icon: icon({
                iconUrl: 'assets/img/mapa-pin-statill.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
              })
            }).bindPopup(`<b>${store.name}</b><br>${store.address || ''}`)
          );
        }
      });
    }
  }
}

