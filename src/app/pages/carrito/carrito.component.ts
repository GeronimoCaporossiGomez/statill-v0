// src/app/pages/carrito/carrito.component.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../servicios/order.service';
import { AuthService } from '../../servicios/auth.service';
import { MiApiService } from '../../servicios/mi-api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  pct_off?: number;
}

interface Store {
  id: number;
  name: string;
  address: string;
  payment_methods: boolean[]; // [Efectivo, Débito, Crédito, QR]
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
})
export class CarritoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private apiService = inject(MiApiService);
  private cdr = inject(ChangeDetectorRef);

  cartItems: CartItem[] = [];
  store: Store | null = null;
  selectedPaymentMethod: number = 0; // Default: Efectivo
  isLoading = false;
  errorMessage: string | null = null;
  storeId: number = 0;
  isDiscountsLoaded = false; // Track discount loading

  paymentMethods = [
    { id: 0, name: 'Efectivo', icon: '💵' },
    { id: 1, name: 'Débito', icon: '💳' },
    { id: 2, name: 'Crédito', icon: '💳' },
    { id: 3, name: 'QR', icon: '📱' },
  ];

  ngOnInit() {
    // Obtener storeId de la URL
    this.storeId = Number(this.route.snapshot.queryParamMap.get('storeId'));
    if (!this.storeId) {
      this.errorMessage = 'Error: No se encontró la tienda';
      return;
    }

    // Obtener items del carrito del localStorage
    const cartData = localStorage.getItem(`cart_${this.storeId}`);
    if (cartData) {
      this.cartItems = JSON.parse(cartData);
      this.loadDiscounts();
    } else {
      this.isDiscountsLoaded = true; // nothing to load
    }

    // Cargar información de la tienda
    this.loadStoreInfo();
  }

  loadDiscounts() {
    if (this.cartItems.length === 0) {
      this.isDiscountsLoaded = true;
      return;
    }

    const discountRequests = this.cartItems.map(item =>
      this.apiService.getDiscountsByProductId(item.id)
        .pipe(catchError(() => of({ pct_off: 0 })))
    );

    forkJoin(discountRequests).subscribe(results => {
      results.forEach((res: any, index) => {
        this.cartItems[index].pct_off = res.pct_off || 0;
      });

      this.isDiscountsLoaded = true; // discounts loaded
      this.cdr.markForCheck();       // force Angular to update view
    });

    console.log(discountRequests)
  }

  loadStoreInfo() {
    this.apiService.getStoreById(this.storeId).subscribe({
      next: (response: any) => {
        if (response.successful && response.data) {
          this.store = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar tienda:', err);
        this.errorMessage = 'Error al cargar información de la tienda';
      },
    });
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => {
      const discount = item.pct_off ?? 0;
      const priceAfterDiscount = item.price * (1 - discount / 100);
      return sum + priceAfterDiscount * item.quantity;
    }, 0);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  isPaymentMethodAllowed(methodId: number): boolean {
    if (!this.store) return false;
    return this.store.payment_methods[methodId];
  }

  updateQuantity(item: CartItem, change: number) {
    item.quantity += change;
    if (item.quantity <= 0) {
      this.removeItem(item);
    } else {
      this.saveCart();
    }
  }

  removeItem(item: CartItem) {
    this.cartItems = this.cartItems.filter((i) => i.id !== item.id);
    this.saveCart();
  }

  saveCart() {
    localStorage.setItem(`cart_${this.storeId}`, JSON.stringify(this.cartItems));
  }

  clearCart() {
    localStorage.removeItem(`cart_${this.storeId}`);
    this.cartItems = [];
  }

  createOrder() {
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'Debes iniciar sesión para realizar un pedido';
      return;
    }

    if (!this.authService.isActiveUser()) {
      this.errorMessage = null;
      this.router.navigate(['/confirmacion-codigo'], { queryParams: { redirect: this.router.url } });
      return;
    }

    if (this.cartItems.length === 0) {
      this.errorMessage = 'El carrito está vacío';
      return;
    }

    if (!this.isPaymentMethodAllowed(this.selectedPaymentMethod)) {
      this.errorMessage = 'El método de pago seleccionado no está disponible en esta tienda';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const order = {
      store_id: this.storeId,
      products: this.cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
      payment_method: this.selectedPaymentMethod,
    };

    console.log('📦 Creando preorden:', order);

    this.orderService.createOrder(order).subscribe({
      next: (response) => {
        console.log('✅ Preorden creada:', response);
        this.isLoading = false;
        this.clearCart();
        const orderId = response.data?.id || response.data;

        // Only redirect to 'no disponible' if the store does NOT accept the selected card method
        if (this.selectedPaymentMethod === 0 || this.selectedPaymentMethod === 3) {
          const paymentParam = this.selectedPaymentMethod === 3 ? 'qr' : 'cash';
          this.router.navigate(['/orden-confirmacion'], { queryParams: { orderId, payment: paymentParam } });
        } else if (!this.isPaymentMethodAllowed(this.selectedPaymentMethod)) {
          this.router.navigate(['/metodo-pago-no-disponible']);
        } else {
          // Card payment accepted, go to confirmation
          this.router.navigate(['/orden-confirmacion'], { queryParams: { orderId, payment: this.selectedPaymentMethod === 1 ? 'debito' : 'credito' } });
        }
      },
      error: (error) => {
        console.error('❌ Error al crear preorden:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al crear el pedido. Intente nuevamente.';
      },
    });
  }

  volver() {
    this.router.navigate(['/negocio', this.storeId]);
  }
}