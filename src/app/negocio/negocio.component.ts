import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComercioService } from '../servicios/comercio.service';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../servicios/auth.service';
import { DOCUMENT } from '@angular/common';
import { GeneralService } from '../servicios/general.service';
@Component({
  selector: 'app-negocio',
  imports: [CommonModule, HeaderStatillComponent, FormsModule],
  templateUrl: './negocio.component.html',
  styleUrl: './negocio.component.scss',
})
export class NegocioComponent implements OnInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comercioService = inject(ComercioService);
  public authService = inject(AuthService);
  private readonly generalService = inject(GeneralService);

  public hasUserReview: boolean = false;
  public currentReview: any = null;

  textValue = '';

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
      reviews: this.comercioService.getReviewsByStore(id),
      points: this.comercioService.getMyPointsInStore(id)
    }).subscribe({
      next: (results) => {
        this.comercio = results.store;
        this.productos = results.productos;
        this.reviews = results.reviews;
        for (const r of this.reviews) {
          this.generalService.getUserFirstNames(r.user_id).subscribe({
            next: (nameAPIResponse: any) => {
              r.userFirstNames = nameAPIResponse.data;
            },
            error: (error) => {
              console.error(
                `❌ Error al cargar el primer nombre del usuario ${r.user_id}: `,
                error,
              );
            },
          });
        }
        this.cargando = false;

        this.checkIfUserHasReviewed(results.reviews);
        this.checkIfUserHasPurchased(id);

        // Verificar si el usuario ha hecho pedidos en esta tienda
        this.checkIfUserHasPurchased(id);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.cargando = false;
        alert('Error al cargar la tienda. Por favor, intente nuevamente.');
        this.router.navigate(['/home']);
      },
    });
  }

  checkIfUserHasReviewed(reviews: any[]) {
    const currentUser = this.authService.getCurrentUser();

    // Check if the current user has a review for this store
    if (currentUser) {
      this.currentReview = reviews.find(
        (review) => review.user_id === currentUser.id,
      );
      this.hasUserReview = !!this.currentReview; // Set true if review exists
    }
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
        this.hasPurchasedFromStore = orders.some(
          (order: any) =>
            order.store_id === storeId &&
            (order.status === 'received' || order.status === 'accepted'),
        );
        this.checkingPurchase = false;
      },
      error: (err) => {
        // Si el error es 403 o 404, el endpoint no está disponible o no tiene permisos
        // En ese caso, permitir la reseña de todas formas (no bloquear la funcionalidad)
        if (err.status === 403 || err.status === 404) {
          console.warn(
            'El endpoint de órdenes no está disponible o no tiene permisos. Permitiendo reseñas.',
          );
          this.hasPurchasedFromStore = true;
        } else {
          console.error('Error al verificar pedidos:', err);
          // Si falla por otro motivo, también permitir la reseña de todas formas
          this.hasPurchasedFromStore = true;
        }
        this.checkingPurchase = false;
      },
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
      alert(
        'Solo puedes dejar una reseña después de haber realizado un pedido en esta tienda.',
      );
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
      desc: this.textValue.trim(),
    };

    this.comercioService.postReview(review).subscribe({
      next: (response) => {
        console.log('Review realizada:', response);
        alert('Reseña enviada con éxito!');
        this.document.location.reload();
        // Recargar las reseñas después de enviar una nueva
        this.comercioService.getReviewsByStore(this.comercio.id).subscribe({
          next: (reviews) => {
            this.reviews = reviews;
            this.textValue = '';
            this.estrellas = 0;
          },
          error: (err) => {
            console.error('Error al recargar reseñas:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error al realizar la reseña:', err);
        const errorMessage =
          err.error?.message ||
          'Error al enviar la reseña. Por favor, intente nuevamente.';
        alert(errorMessage);
      },
    });
  }

  deleteReview(): void {
    const currentUser = this.authService.getCurrentUser();
    // Make sure the user is authenticated and that they have a review
    if (!currentUser) {
      alert('Debes iniciar sesión para eliminar una reseña.');
      return;
    }

    if (!this.currentReview) {
      alert('No tienes reseña para eliminar.');
      return;
    }

    // Send request to delete the review
    this.comercioService.deleteReview(this.currentReview.id).subscribe({
      next: (response) => {
        console.log('Reseña eliminada:', response);
        alert('Reseña eliminada con éxito!');

        // Update the reviews list after deleting the review
        this.reviews = this.reviews.filter(
          (review) => review.id !== this.currentReview.id,
        );
        this.hasUserReview = false; // Reset the review state
        this.currentReview = null; // Clear the current review
      },
      error: (err) => {
        console.error('Error al eliminar la reseña:', err);
        alert('Error al eliminar la reseña. Por favor, intente nuevamente.');
      },
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
      alert(
        'Debes iniciar sesión y verificar tu email para realizar una compra.',
      );
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Error: No se pudo obtener tu información de usuario.');
      return;
    }

    const products = Object.entries(this.carrito).map(
      ([productId, quantity]) => ({
        product_id: Number(productId),
        quantity: quantity,
      }),
    );

    const venta = {
      store_id: this.comercio.id,
      products: products,
      payment_method: 0, // 0 = cash según la API
      user_id: currentUser.id,
    };

    this.comercioService.postSales(venta).subscribe({
      next: (response) => {
        console.log('Venta realizada:', response);
        alert('Compra realizada exitosamente!');
        this.carrito = {};
      },
      error: (err) => {
        console.error('Error al realizar la venta:', err);
        const errorMessage =
          err.error?.message ||
          'Error al realizar la compra. Por favor, intente nuevamente.';
        alert(errorMessage);
      },
    });
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
