import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComercioService } from '../../servicios/comercio.service';
import { MiApiService, Product, Store } from '../../servicios/mi-api.service';
import { AuthService } from '../../servicios/auth.service';
import { SidebarComponent } from '../../Componentes/sidebar-statill/sidebar.component';
import { Subscription } from 'rxjs';

interface SaleItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  barcode?: string;
}

interface PaymentMethodOption {
  id: number;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-ventas-locales',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],  
  templateUrl: './ventas-locales.component.html',
  styleUrls: ['./ventas-locales.component.scss'],
})
export class VentasLocalesComponent implements OnInit, OnDestroy {
  storeId: number | null = null;
  store: Store | null = null;
  isLoading = true;
  isSubmitting = false;
  loadError: string | null = null;
  feedbackMessage: { type: 'success' | 'error'; text: string } | null = null;

  searchTerm = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  saleItems: SaleItem[] = [];

  paymentMethods: PaymentMethodOption[] = [
    { id: 0, label: 'Efectivo', icon: '💵' },
    { id: 1, label: 'Débito', icon: '🏦' },
    { id: 2, label: 'Crédito', icon: '💳' },
    { id: 3, label: 'QR', icon: '📱' },
  ];
  selectedPaymentMethod = 0;

  assignToCustomer = false;
  customerIdInput = '';

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private comercioService: ComercioService,
    private miApiService: MiApiService,
    private router: Router,
  ) {}

  scannerPopupOpen = false;

openScannerPopup() {
  this.scannerPopupOpen = true;
}

closeScannerPopup() {
  this.scannerPopupOpen = false;
}

  ngOnInit(): void {
    this.storeId = this.authService.getStoreId();

    if (!this.storeId) {
      this.loadError =
        'No encontramos tu tienda. Inicia sesión nuevamente o verificá que tu cuenta tenga acceso al local.';
      this.isLoading = false;
      return;
    }

    this.loadInitialData(this.storeId);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get totalAmount(): number {
    return this.saleItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
  }

  get totalUnits(): number {
    return this.saleItems.reduce((acc, item) => acc + item.quantity, 0);
  }

  allowedPaymentMethods(): PaymentMethodOption[] {
    if (!this.store?.payment_methods) {
      return this.paymentMethods;
    }

    const available = this.paymentMethods.filter(
      (method) => this.store?.payment_methods?.[method.id],
    );

    return available.length > 0 ? available : this.paymentMethods;
  }

  onSearchChange(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredProducts = [...this.products];
      return;
    }

    this.filteredProducts = this.products.filter((product) => {
      const nameMatch = product.name?.toLowerCase()?.includes(term);
      const brandMatch = product.brand?.toLowerCase()?.includes(term);
      const barcodeMatch = product.barcode?.toLowerCase()?.includes(term);
      return nameMatch || brandMatch || barcodeMatch;
    });
  }

  addItem(product: Product): void {
    const existing = this.saleItems.find(
      (item) => item.product_id === product.id,
    );

    if (existing) {
      this.updateQuantity(existing.product_id, existing.quantity + 1);
      return;
    }

    this.saleItems = [
      ...this.saleItems,
      {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.quantity ?? 0,
        barcode: product.barcode,
      },
    ];
  }

  removeItem(productId: number): void {
    this.saleItems = this.saleItems.filter(
      (item) => item.product_id !== productId,
    );
  }

  updateQuantity(productId: number, quantity: number): void {
    this.saleItems = this.saleItems.map((item) => {
      if (item.product_id !== productId) {
        return item;
      }

      const safeQuantity = Math.min(
        Math.max(quantity, 1),
        item.stock || quantity,
      );

      return { ...item, quantity: safeQuantity };
    });
  }

  clearSale(): void {
    this.saleItems = [];
    this.feedbackMessage = null;
  }

  createSale(): void {
    if (!this.storeId || this.saleItems.length === 0) {
      this.feedbackMessage = {
        type: 'error',
        text: 'Agregá al menos un producto para registrar la venta.',
      };
      return;
    }
  
    // Set userId to null if assignToCustomer is unchecked or invalid ID
    let userId: number | null = null;
  
    if (this.assignToCustomer && this.customerIdInput.trim() !== '') {
      userId = Number(this.customerIdInput);
    }
  
    // If the checkbox is checked but the user ID is invalid, show an error
    if (
      this.assignToCustomer &&
      (userId === null || isNaN(userId) || userId <= 0)
    ) {
      this.feedbackMessage = {
        type: 'error',
        text: 'Ingresá un ID de cliente válido para asignar la venta.',
      };
      return;
    }
  
    // Prepare the payload for the sale request
    const payload = {
      store_id: this.storeId,
      products: this.saleItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      payment_method: this.selectedPaymentMethod,
      user_id: userId, // Will be null if no customer is assigned
    };
    console.log(payload)
  
    this.isSubmitting = true;
    this.feedbackMessage = null;
  
    // Call the API to create the sale
    const sub = this.comercioService.postSales(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.feedbackMessage = {
          type: 'success',
          text: 'Venta registrada correctamente. ¡Buen trabajo!',
        };
        this.saleItems = [];
        this.assignToCustomer = false;
        this.customerIdInput = '';
  
        const createdId = response?.data?.id ?? response?.data;
        if (createdId) {
          console.log('Venta registrada con ID:', createdId);
        }
  
        this.reloadProducts();
      },
      error: (error) => {
        this.isSubmitting = false;
        const backendMessage =
          error?.error?.message ||
          'No pudimos registrar la venta. Reintentá en unos segundos.';
        this.feedbackMessage = {
          type: 'error',
          text: backendMessage,
        };
      },
    });
  
    this.subscriptions.add(sub);
  }

  navigateBack(): void {
    this.router.navigate(['/menu-local']);
  }

  private loadInitialData(storeId: number): void {
    this.isLoading = true;
    this.loadError = null;

    const storeSub = this.miApiService.getStoreById(storeId).subscribe({
      next: (response: any) => {
        if (response.successful && response.data) {
          this.store = response.data;
          this.selectedPaymentMethod = this.allowedPaymentMethods()[0]?.id ?? 0;
        }
      },
      error: (error) => {
        console.error('Error al cargar tienda', error);
        this.loadError =
          'No pudimos obtener la información del local. Reintentá en unos minutos.';
      },
      complete: () => {
        this.loadProducts(storeId);
      },
    });

    this.subscriptions.add(storeSub);
  }

  private loadProducts(storeId: number): void {
    const productSub = this.miApiService.getProductosById(storeId).subscribe({
      next: (response: any) => {
        if (response.successful && Array.isArray(response.data)) {
          this.products = response.data;
          this.filteredProducts = [...this.products];
        } else {
          this.loadError = 'Todavía no hay productos cargados en esta tienda.';
        }
      },
      error: (error) => {
        console.error('Error al cargar productos', error);
        this.loadError =
          'No pudimos obtener los productos. Reintentá en unos minutos.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });

    this.subscriptions.add(productSub);
  }

  private reloadProducts(): void {
    if (!this.storeId) {
      return;
    }

    const refreshSub = this.miApiService
      .getProductosById(this.storeId)
      .subscribe({
        next: (response: any) => {
          if (response.successful && Array.isArray(response.data)) {
            this.products = response.data;
            this.onSearchChange();
          }
        },
        error: (error) => {
          console.error(
            'No se pudo refrescar el stock después de la venta',
            error,
          );
        },
      });

    this.subscriptions.add(refreshSub);
  }
}
