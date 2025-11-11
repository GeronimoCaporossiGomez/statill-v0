// src/app/pages/carrito/carrito.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../servicios/order.service';
import { AuthService } from '../../servicios/auth.service';
import { MiApiService } from '../../servicios/mi-api.service';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Store {
  id: number;
  name: string;
  payment_methods: boolean[]; // [Efectivo, Débito, Crédito, Transferencia]
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss']
})
export class CarritoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private apiService = inject(MiApiService);

  cartItems: CartItem[] = [];
  store: Store | null = null;
  selectedPaymentMethod: number = 0; // Default: Efectivo
  isLoading = false;
  errorMessage: string | null = null;
  storeId: number = 0;

  paymentMethods = [
    { id: 0, name: 'Efectivo', icon: '💵' },
    { id: 1, name: 'Débito', icon: '💳' },
    { id: 2, name: 'Crédito', icon: '💳' },
    { id: 3, name: 'Transferencia', icon: '📱' }
  ];

  ngOnInit() {
    // Obtener storeId de la URL
    this.storeId = Number(this.route.snapshot.queryParamMap.get('storeId'));
    
    // Obtener items del carrito del localStorage
    const cartData = localStorage.getItem(`cart_${this.storeId}`);
    if (cartData) {
      this.cartItems = JSON.parse(cartData);
    }

    // Cargar información de la tienda
    this.loadStoreInfo();
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
      }
    });
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
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
    // Validaciones
    if (!this.authService.isActiveUser()) {
      this.errorMessage = 'Debes iniciar sesión para realizar un pedido';
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

    // Preparar la orden
    const order = {
      store_id: this.storeId,
      products: this.cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      })),
      payment_method: this.selectedPaymentMethod
    };

    // Crear la orden
    this.orderService.createOrder(order).subscribe({
      next: (response) => {
        console.log('✅ Orden creada:', response);
        this.isLoading = false;
        
        // Limpiar carrito
        this.clearCart();

        // Redirigir según el método de pago
        if (this.selectedPaymentMethod === 0) {
          // Efectivo - ir a página de confirmación
          this.router.navigate(['/orden-confirmacion'], {
            queryParams: { orderId: response.data }
          });
        } else {
          // Otros métodos - ir a página de no disponible
          this.router.navigate(['/metodo-pago-no-disponible']);
        }
      },
      error: (error) => {
        console.error('❌ Error al crear orden:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al crear el pedido. Intente nuevamente.';
      }
    });
  }

  volver() {
    this.router.navigate(['/negocio', this.storeId]);
  }
}