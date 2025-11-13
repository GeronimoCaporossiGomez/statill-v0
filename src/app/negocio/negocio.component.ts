import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComercioService } from '../servicios/comercio.service';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../servicios/auth.service';
import { GeneralService } from '../servicios/general.service';
import { MiApiService } from '../servicios/mi-api.service';

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
  private readonly api = inject(MiApiService);

  public hasUserReview: boolean = false;
  public currentReview: any = null;

  textValue = '';

  comercio: any = null;
  productos: any[] = [];
  reviews: any[] = [];
  userPoints: any = null;
  cargando = true;
  carrito: { [key: number]: number } = {};
  hasPurchasedFromStore: boolean = false;
  checkingPurchase: boolean = false;

  estrellas: number = 0;
  public image: string = '';

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

    forkJoin({
      store: this.comercioService.getStoreById(id),
      productos: this.comercioService.getProductosByStore(id),
      reviews: this.comercioService.getReviewsByStore(id),
      points: this.comercioService.getMyPointsInStore(id),
    }).subscribe({
      next: (results) => {
        this.comercio = results.store;
        // getImageByObjectId returns an Observable<GetCloudinaryURLResponse>, subscribe and set the string URL
        this.api
          .getImageByObjectId('store', Number(this.comercio.id))
          .subscribe({
            next: (imgRes: any) => {
              this.image = imgRes.data;
            },
            error: (err: any) => {
              console.error('Error cargando imagen de la tienda:', err);
              this.image = '';
            },
          });
          this.productos = results.productos;
          // For each product, try to fetch its image URL and set `producto.image` so the template can show it
          for (const p of this.productos) {
            if (p && p.id) {
              this.api.getImageByObjectId('product', Number(p.id)).subscribe({
                next: (imgRes: any) => {
                  p.image = imgRes?.data || '';
                },
                error: (err: any) => {
                  p.image = '';
                },
              });
            } else {
              p.image = '';
            }
          }
        this.reviews = results.reviews;

        const points = results.points;
        this.userPoints = points;

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
    if (currentUser) {
      this.currentReview = reviews.find(
        (review) => review.user_id === currentUser.id,
      );
      this.hasUserReview = !!this.currentReview;
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
        this.hasPurchasedFromStore = orders.some(
          (order: any) =>
            order.store_id === storeId &&
            (order.status === 'received' || order.status === 'accepted'),
        );
        this.checkingPurchase = false;
      },
      error: (err) => {
        if (err.status === 403 || err.status === 404) {
          console.warn(
            'El endpoint de órdenes no está disponible o no tiene permisos. Permitiendo reseñas.',
          );
          this.hasPurchasedFromStore = true;
        } else {
          console.error('Error al verificar pedidos:', err);
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
    if (!this.authService.isActiveUser()) {
      alert('Debes iniciar sesión y verificar tu email para dejar una reseña.');
      return;
    }

    if (!this.comercio || !this.comercio.id) {
      alert('Error: No se pudo cargar la información de la tienda.');
      return;
    }

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
    if (!currentUser) {
      alert('Debes iniciar sesión para eliminar una reseña.');
      return;
    }

    if (!this.currentReview) {
      alert('No tienes reseña para eliminar.');
      return;
    }

    this.comercioService.deleteReview(this.currentReview.id).subscribe({
      next: (response) => {
        console.log('Reseña eliminada:', response);
        alert('Reseña eliminada con éxito!');
        this.reviews = this.reviews.filter(
          (review) => review.id !== this.currentReview.id,
        );
        this.hasUserReview = false;
        this.currentReview = null;
      },
      error: (err) => {
        console.error('Error al eliminar la reseña:', err);
        alert('Error al eliminar la reseña. Por favor, intente nuevamente.');
      },
    });
  }

  // 🔹 NUEVA FUNCIÓN FINALIZAR COMPRA (versión mejorada)
  finalizarCompra() {
    if (!this.comercio || !this.comercio.id) {
      alert('Error: No se pudo cargar la información de la tienda.');
      return;
    }

    if (this.getTotalItems() === 0) {
      alert('Agregue productos al carrito');
      return;
    }

    // Verificar autenticación
    if (!this.authService.isActiveUser()) {
      alert(
        'Debes iniciar sesión y verificar tu email para realizar una compra.',
      );
      return;
    }

    // Preparar datos del carrito
    const cartData = Object.entries(this.carrito).map(
      ([productId, quantity]) => {
        const producto = this.productos.find((p) => p.id === Number(productId));
        return {
          id: Number(productId),
          name: producto?.name || 'Producto',
          price: producto?.price || 0,
          quantity: quantity,
          image: producto?.image,
        };
      },
    );

    // Guardar en localStorage
    localStorage.setItem(`cart_${this.comercio.id}`, JSON.stringify(cartData));

    // Redirigir al carrito
    this.router.navigate(['/carrito'], {
      queryParams: { storeId: this.comercio.id },
    });
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
