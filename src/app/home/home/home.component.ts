import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';
import { DiscountsStatillComponent } from 'src/app/Componentes/Discounts-statill/Discounts-statill.component';
import {
  Discount,
  DiscountsResponse,
  MiApiService,
  Store,
  StoresResponse,
} from '../../servicios/mi-api.service';
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    FormsModule,
    RouterModule,
    HeaderStatillComponent,
    DiscountsStatillComponent,
    SidebarComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // Variables para búsqueda
  searchTerm: string = '';
  stores: Store[] = [];
  filteredStores: Store[] = [];
  promotions: Discount[] = null; 
  isLoading: boolean = true;
  showSearchResults: boolean = false;

  // Promociones atractivas

  constructor(private apiService: MiApiService) {}

  ngOnInit(): void {
    this.loadStores();
    this.loadDiscounts();
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
      },
    });
  }

  loadDiscounts(): void {
    this.apiService.getDiscounts().subscribe({
      next: (data) => {
        this.promotions = data.data;
        console.log("Descuentos:");
        console.log(this.promotions);
        this.isLoading = false; // Data has been loaded, stop loading
      },
      error: (error) => {
        console.error('Error fetching discounts or products:', error);
        this.isLoading = false;
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTerm.trim() === '') {
      this.showSearchResults = false;
      this.filteredStores = this.stores;
      return;
    }

    this.showSearchResults = true;
    this.filteredStores = this.stores.filter(
      (store) =>
        this.normalizeText(store.name).includes(
          this.normalizeText(this.searchTerm),
        ) ||
        this.normalizeText(store.address).includes(
          this.normalizeText(this.searchTerm),
        ),
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
      case 0:
        return 'Restaurante';
      case 1:
        return 'Kiosco';
      case 2:
        return 'Supermercado';
      case 3:
        return 'Panadería';
      default:
        return 'Comercio';
    }
  }

  goToStore(storeId: number): void {
    // Redirigir a la página de la tienda
    window.location.href = `/negocio/${storeId}`;
  }
}
