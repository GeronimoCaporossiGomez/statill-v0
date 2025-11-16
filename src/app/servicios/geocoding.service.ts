import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay, switchMap } from 'rxjs/operators';
import { MiApiService } from './mi-api.service';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  constructor(private api: MiApiService) {}
  geocode(
    address: string,
  ): Observable<{
    latitude: number;
    longitude: number;
    formatted_address: string;
  } | null> {
    if (!address || address.trim() === '') {
      return of(null);
    }

    return this.api.geocodeAddress(address).pipe(
      map((response) => ({
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        formatted_address: response.data.formatted_address,
      })),
      catchError((ex) => {
        console.error(ex);
        return of(null);
      }),
    );
  }

  reverseGeocode(
    latitude: number,
    longitude: number,
  ): Observable<{ address: string } | null> {
    if (latitude === null || longitude === null) {
      return of(null);
    }

    return this.api.reverseGeocode(latitude, longitude).pipe(
      map((response) => ({
        address: response.data.address,
      })),
      catchError(() => of(null)),
    );
  }
}
