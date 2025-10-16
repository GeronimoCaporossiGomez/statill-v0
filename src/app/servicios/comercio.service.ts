import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComercioService {
  private comercios: any[] = [
    { id: 'mcdonalds', nombre: 'McDonald\'s', descripcion: 'Comida rápida' },
    { id: 'burger-king', nombre: 'Burger King', descripcion: 'Hamburguesas' },
    { id: 'marcos', nombre: 'Marquitiwis', descripcion: 'puto' },
    { id: 'starbucks', nombre: 'Starbucks', descripcion: 'Café premium' }
  ];

  getComercios(): any[] {
    return this.comercios;
  }

  getComercioById(id: string): any | undefined {
    return this.comercios.find(c => c.id === id);
  }
  constructor() { }
}
