import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';
import { DiscountsStatillComponent } from 'src/app/Componentes/Discounts-statill/Discounts-statill.component';
import { MiApiService, Store, StoresResponse } from '../../servicios/mi-api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule, RouterModule, HeaderStatillComponent, DiscountsStatillComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Variables para búsqueda
  searchTerm: string = '';
  stores: Store[] = [];
  filteredStores: Store[] = [];
  isLoading: boolean = true;
  showSearchResults: boolean = false;

  // Promociones atractivas usando el logo de El Jevi
  promotions = [
    {
      id: 1,
      storeName: 'EL JEVI',
      discountText: '🔥 30% OFF en todos los Disco 🔥',
      logoUrl: 'assets/img/tienda.png',
      storeId: 2
    },
    {
      id: 2,
      storeName: 'EL JEVI',
      discountText: '¡Seguí acumulando puntos en Taco Bell!',
      logoUrl: 'assets/img/tienda.png',
      storeId: null
    },
    {
      id: 3,
      storeName: 'EL JEVI',
      discountText: '¿Tenés ganas de pollo frito? ¡Aprovechá los descuentos!',
      logoUrl: 'assets/img/tienda.png',
      storeId: null
    },
    {
      id: 4,
      storeName: 'EL JEVI',
      discountText: 'Preordená con 20% OFF en kioscos EL JEVI 🔥',
      logoUrl: 'assets/img/tienda.png',
      storeId: null
    }
  ];

  constructor(private apiService: MiApiService) { }

  ngOnInit(): void {
    this.loadStores();
  }

  loadStores(): void {
    this.isLoading = true;
    this.apiService.getStores().subscribe({
      next: (response: StoresResponse) => {
        if (response.successful && response.data) {
          this.stores = response.data;
          this.filteredStores = this.stores;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar tiendas:', error);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    if (this.searchTerm.trim() === '') {
      this.showSearchResults = false;
      this.filteredStores = this.stores;
      return;
    }

    this.showSearchResults = true;
    this.filteredStores = this.stores.filter(store =>
      this.normalizeText(store.name).includes(this.normalizeText(this.searchTerm)) ||
      this.normalizeText(store.address).includes(this.normalizeText(this.searchTerm))
    );
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remueve acentos
  }

  getCategoryName(category: number): string {
    switch (category) {
      case 0: return 'Restaurante';
      case 1: return 'Kiosco';
      case 2: return 'Supermercado';
      case 3: return 'Panadería';
      default: return 'Comercio';
    }
  }

  goToStore(storeId: number): void {
    // Redirigir a la página de la tienda
    window.location.href = `/negocio/${storeId}`;
  }
}