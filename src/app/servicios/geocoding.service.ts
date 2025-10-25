import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private nominatimUrl = '/nominatim/search';

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
    // ✅ Headers requeridos por Nominatim
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Accept-Language': 'es-AR,es;q=0.9',
      // Nota: User-Agent no se puede setear desde el browser por seguridad,
      // pero Nominatim lo requiere. Si sigue fallando, usar proxy.
    });

    const params = {
      q: address,
      format: 'json',
      limit: '1',
      addressdetails: '1',
      countrycodes: 'ar' // Limitar a Argentina para mejor precisión
    };

    console.log('🌍 Geocodificando:', address);

    return this.http.get<any[]>(this.nominatimUrl, { params, headers }).pipe(
      delay(1000), // ✅ Respetar rate limit de Nominatim (1 req/seg)
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
