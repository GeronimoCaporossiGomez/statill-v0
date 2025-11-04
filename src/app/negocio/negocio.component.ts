import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComercioService } from '../servicios/comercio.service';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

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

  textValue = ""

  comercio: any;
  productos: any[] = [];
  resenas: any[] = [];
  cargando = true;
  carrito: { [key: number]: number } = {}; // { productoId: cantidad }

  estrellas: number = 0;

  setValue(value: number): void {
    this.estrellas = value;
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Cargar todo junto con forkJoin
    forkJoin({
      store: this.comercioService.getStoreById(id),
      productos: this.comercioService.getProductosByStore(id),
      reviews: this.comercioService.getReviewsByStore(id)
    }).subscribe({
      error: (err) => {
        this.cargando = false;
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
    if (this.textValue.trim() === '') {
      alert('Por favor, escribe una reseña.');
      return;
    }

    const review = {
      store_id: this.comercio.id,
      user_id: 37,
      stars: this.estrellas,
      desc: this.textValue
    };

    this.comercioService.postReview(review).subscribe({
      next: (response) => {
        console.log('Review realizada:', response);
        alert('Reseña enviada con éxito!');
        // Recargar las resenas después de enviar una nueva
        this.comercioService.getReviewsByStore(this.comercio.id).subscribe({
          next: (reviews) => {
            this.resenas = reviews;
            this.textValue = '';
            this.estrellas = 0;
          }
        });
      },
      error: (err) => {
        console.error('Error al realizar la reseña:', err);
        console.error('Error al realizar la reseña:', err.status, err.message, err.error);
        console.log('Review payload:', review, this.comercio.id);
      }
    });
  }

  finalizarCompra() {
    if (this.getTotalItems() === 0) {
      alert('Agregue productos al carrito');
      return;
    }

    const products = Object.entries(this.carrito).map(([productId, quantity]) => ({
      product_id: Number(productId),
      quantity: quantity
    }));

    const venta = {
      store_id: this.comercio.id,
      products: products,
      payment_method: 3,
      user_id: 1
    };

    this.comercioService.postSales(venta).subscribe({
      next: (response) => {
        console.log('Venta realizada:', response);
        alert('Compra realizada exitosamente!');
        this.carrito = {};
      },
      error: (err) => {
        console.error('Error al realizar la venta:', err);
        alert('Error al realizar la compra');
      }
    });
  }

  volver() {
    this.router.navigate(['/configuracion']);
  }
}
