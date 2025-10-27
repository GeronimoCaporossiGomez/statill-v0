import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private http = inject(HttpClient);

  // ✅ Usar endpoint propio en producción, Nominatim directo en dev
  private nominatimUrl = isDevMode()
    ? '/api/nominatim'  // ✅ Tu API en Vercel
    : '/nominatim/search'; // ✅ Proxy local en desarrollo

  geocode(address: string): Observable<{lat: number, lng: number} | null> {
    if (!address || address.trim() === '') {
      return of(null);
    }

    return this.geocodeIntento(address).pipe(
      catchError(() => {
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
      countrycodes: 'ar'
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
      }),
      catchError(error => {
        console.error('❌ Error en geocodificación:', error);
        throw error;
      })
    );
  }

  private simplificarDireccion(address: string): string {
    let simplified = address.replace(/[A-Z]\d{4}[A-Z]{3}/g, '');
    simplified = simplified.replace(/C(iudad|dad)\.?\s*Autónoma\s*de\s*/gi, '');
    simplified = simplified.replace(/Buenos\s*Aires/gi, 'CABA, Argentina');
    simplified = simplified.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();

    console.log('📝 Dirección simplificada:', simplified);
    return simplified;
  }
}
