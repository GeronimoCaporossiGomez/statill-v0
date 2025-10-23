import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  geocode(address: string): Observable<{lat: number, lng: number} | null> {
    if (!address || address.trim() === '') {
      return of(null);
    }

    // Intentar geocodificar con la dirección completa
    return this.geocodeIntento(address).pipe(
      catchError(() => {
        // Si falla, intentar con dirección simplificada
        console.log('🔄 Reintentando con dirección simplificada...');
        const addressSimplificada = this.simplificarDireccion(address);
        return this.geocodeIntento(addressSimplificada);
      }),
      catchError(() => {
        console.log('❌ No se pudo geocodificar después de intentos');
        return of(null);
      })
    );
  }

  private geocodeIntento(address: string): Observable<{lat: number, lng: number} | null> {
    const params = {
      q: address,
      format: 'json',
      limit: '1',
      addressdetails: '1',
      countrycodes: 'ar' // Limitar a Argentina para mejor precisión
    };

    console.log('🌍 Geocodificando:', address);

    return this.http.get<any[]>(this.nominatimUrl, { params }).pipe(
      delay(1000),
      map(results => {
        if (results && results.length > 0) {
          console.log('✅ Resultado encontrado:', results[0]);
          return {
            lat: parseFloat(results[0].lat),
            lng: parseFloat(results[0].lon)
          };
        }
        throw new Error('No results');
      })
    );
  }

  private simplificarDireccion(address: string): string {
    // Remover código postal (ej: C1429BNR)
    let simplified = address.replace(/[A-Z]\d{4}[A-Z]{3}/g, '');

    // Remover "Cdad. Autónoma de" o "Ciudad Autónoma de"
    simplified = simplified.replace(/C(iudad|dad)\.?\s*Autónoma\s*de\s*/gi, '');

    // Simplificar "Buenos Aires" a "CABA" o viceversa
    simplified = simplified.replace(/Buenos\s*Aires/gi, 'CABA, Argentina');

    // Limpiar comas duplicadas y espacios extra
    simplified = simplified.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();

    console.log('📝 Dirección simplificada:', simplified);
    return simplified;
  }
}
