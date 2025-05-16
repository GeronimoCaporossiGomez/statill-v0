import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ubicacion.component.html',
  styleUrls: ['./ubicacion.component.scss']
})
export class UbicacionComponent implements AfterViewInit {
  map!: L.Map;
  marker!: L.Marker;
  lat = -34.6037; // Buenos Aires por defecto
  lng = -58.3816;

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.map = L.map('map').setView([this.lat, this.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([this.lat, this.lng], { draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => {
      const { lat, lng } = this.marker.getLatLng();
      this.lat = +lat.toFixed(6);
      this.lng = +lng.toFixed(6);
    });
  }

  guardarUbicacion(): void {
    console.log('📍 Ubicación guardada:', this.lat, this.lng);
    alert('Ubicación guardada correctamente.');
    // Aquí luego se integrará con backend
  }
}
