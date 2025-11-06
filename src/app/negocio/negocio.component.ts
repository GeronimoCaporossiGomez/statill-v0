import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComercioService } from '../servicios/comercio.service';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-negocio',
  imports: [CommonModule, HeaderStatillComponent, FormsModule],
  templateUrl: './negocio.component.html',
  styleUrl: './negocio.component.scss',
})
export class NegocioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comercioService = inject(ComercioService);
  public authService = inject(AuthService);

  textValue = ""

  comercio: any = null;
  productos: any[] = [];
  reviews: any[] = [];
  cargando = true;
  carrito: { [key: number]: number } = {}; // { productoId: cantidad }
  hasPurchasedFromStore: boolean = false;
  checkingPurchase: boolean = false;

  estrellas: number = 0;

  setValue(value: number): void {
    this.estrellas = value;
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || isNaN(id)) {
      console.error('ID de tienda inválido');
      this.cargando = false;
      this.router.navigate(['/home']);
      return;
    }

    // Cargar todo junto con forkJoin
    forkJoin({
      store: this.comercioService.getStoreById(id),
      productos: this.comercioService.getProductosByStore(id),
      reviews: this.comercioService.getReviewsByStore(id)
    }).subscribe({
      next: (results) => {
        this.comercio = results.store;
        this.productos = results.productos;
        this.reviews = results.reviews;
        this.cargando = false;
        
        // Verificar si el usuario ha hecho pedidos en esta tienda
        this.checkIfUserHasPurchased(id);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.cargando = false;
        alert('Error al cargar la tienda. Por favor, intente nuevamente.');
        this.router.navigate(['/home']);
      }
    });
  }

  checkIfUserHasPurchased(storeId: number) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.authService.isActiveUser()) {
      this.hasPurchasedFromStore = false;
      return;
    }

    this.checkingPurchase = true;
    this.comercioService.getMyOrders().subscribe({
      next: (orders: any[]) => {
        // Verificar si hay algún pedido en esta tienda
        this.hasPurchasedFromStore = orders.some((order: any) => 
          order.store_id === storeId && 
          (order.status === 'received' || order.status === 'accepted')
        );
        this.checkingPurchase = false;
      },
      error: (err) => {
        // Si el error es 403 o 404, el endpoint no está disponible o no tiene permisos
        // En ese caso, permitir la reseña de todas formas (no bloquear la funcionalidad)
        if (err.status === 403 || err.status === 404) {
          console.warn('El endpoint de órdenes no está disponible o no tiene permisos. Permitiendo reseñas.');
          this.hasPurchasedFromStore = true;
        } else {
          console.error('Error al verificar pedidos:', err);
          // Si falla por otro motivo, también permitir la reseña de todas formas
          this.hasPurchasedFromStore = true;
        }
        this.checkingPurchase = false;
      }
    });
  }

  getCantidad(productoId: number): number {
    return this.carrito[productoId] || 0;
  }

  agregarProducto(productoId: number) {
    if (!this.carrito[productoId]) {
      this.carrito[productoId] = 0;
    }
    this.carrito[productoId]++;
  }

  quitarProducto(productoId: number) {
    if (this.carrito[productoId] && this.carrito[productoId] > 0) {
      this.carrito[productoId]--;
      if (this.carrito[productoId] === 0) {
        delete this.carrito[productoId];
      }
    }
  }

  getTotalItems(): number {
    return Object.values(this.carrito).reduce((sum, cant) => sum + cant, 0);
  }

  submitReview(): void {
    // Verificar que el usuario esté autenticado
    if (!this.authService.isActiveUser()) {
      alert('Debes iniciar sesión y verificar tu email para dejar una reseña.');
      return;
    }

    // Verificar que la tienda esté cargada
    if (!this.comercio || !this.comercio.id) {
      alert('Error: No se pudo cargar la información de la tienda.');
      return;
    }

    // Verificar si el usuario ha hecho pedidos en esta tienda
    if (!this.hasPurchasedFromStore && !this.checkingPurchase) {
      alert('Solo puedes dejar una reseña después de haber realizado un pedido en esta tienda.');
      return;
    }

    if (this.estrellas === 0) {
      alert('Por favor, selecciona una calificación.');
      return;
    }

    if (this.textValue.trim() === '') {
      alert('Por favor, escribe una reseña.');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Error: No se pudo obtener tu información de usuario.');
      return;
    }

    const review = {
      store_id: this.comercio.id,
      stars: this.estrellas,
      desc: this.textValue.trim()
    };

    this.comercioService.postReview(review).subscribe({
      next: (response) => {
        console.log('Review realizada:', response);
        alert('Reseña enviada con éxito!');
        // Recargar las reseñas después de enviar una nueva
        this.comercioService.getReviewsByStore(this.comercio.id).subscribe({
          next: (reviews) => {
            this.reviews = reviews;
            this.textValue = '';
            this.estrellas = 0;
          },
          error: (err) => {
            console.error('Error al recargar reseñas:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al realizar la reseña:', err);
        const errorMessage = err.error?.message || 'Error al enviar la reseña. Por favor, intente nuevamente.';
        alert(errorMessage);
      }
    });
  }

  finalizarCompra() {
    if (!this.comercio || !this.comercio.id) {
      alert('Error: No se pudo cargar la información de la tienda.');
      return;
    }

    if (this.getTotalItems() === 0) {
      alert('Agregue productos al carrito');
      return;
    }

    // Verificar que el usuario esté autenticado
    if (!this.authService.isActiveUser()) {
      alert('Debes iniciar sesión y verificar tu email para realizar una compra.');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Error: No se pudo obtener tu información de usuario.');
      return;
    }

    const products = Object.entries(this.carrito).map(([productId, quantity]) => ({
      product_id: Number(productId),
      quantity: quantity
    }));

    const venta = {
      store_id: this.comercio.id,
      products: products,
      payment_method: 0, // 0 = cash según la API
      user_id: currentUser.id
    };

    this.comercioService.postSales(venta).subscribe({
      next: (response) => {
        console.log('Venta realizada:', response);
        alert('Compra realizada exitosamente!');
        this.carrito = {};
      },
      error: (err) => {
        console.error('Error al realizar la venta:', err);
        const errorMessage = err.error?.message || 'Error al realizar la compra. Por favor, intente nuevamente.';
        alert(errorMessage);
      }
    });
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
