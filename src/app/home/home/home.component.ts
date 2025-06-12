import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('700ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  searchTerm = '';
  precioMax: number | null = null;
  filtrosAvanzados = false;
  sidebarAbierto = false;

  productos = [
    {
      id: 'P001',
      nombre: 'Hamburguesa Veggie',
      tienda: 'Burgers House',
      precio: 1500,
      distancia: 1.2,
      promoActiva: true,
      descuento: 20,
      finPromo: new Date(new Date().getTime() + 3600000) // 1 hora
    },
    {
      id: 'P002',
      nombre: 'Smoothie Frutal',
      tienda: 'GreenBar',
      precio: 1200,
      distancia: 0.5,
      promoActiva: false
    },
    {
      id: 'P003',
      nombre: 'Café Especial',
      tienda: 'Coffee Spot',
      precio: 900,
      distancia: 2.8,
      promoActiva: true,
      descuento: 15,
      finPromo: new Date(new Date().getTime() + 7200000) // 2 horas
    }
  ];

  carrito: any[] = [];
  mostrarCarrito = false;
  ahora: Date = new Date();
  relojSub: Subscription | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.relojSub = interval(1000).subscribe(() => {
      this.ahora = new Date();
    });
  }

  ngOnDestroy() {
    this.relojSub?.unsubscribe();
  }

  get productosFiltrados() {
    let result = this.productos;
    const term = this.searchTerm.toLowerCase();

    if (this.filtrosAvanzados) {
      if (term.trim()) {
        result = result.filter(p =>
          p.nombre.toLowerCase().includes(term) ||
          p.tienda.toLowerCase().includes(term)
        );
      }

      if (this.precioMax !== null && this.precioMax > 0) {
        result = result.filter(p => p.precio <= this.precioMax);
      }
    } else {
      if (term.trim()) {
        result = result.filter(p =>
          p.nombre.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term)
        );
      }
    }

    return result.sort((a, b) => a.distancia - b.distancia);
  }

  tiempoRestante(fin: Date): string {
    const ms = new Date(fin).getTime() - this.ahora.getTime();
    if (ms <= 0) return '00:00:00';

    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60) % 60;
    const h = Math.floor(ms / 3600);
    return `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  }

  pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }

  buscarProductos() {
    console.log('Filtrando:', {
      term: this.searchTerm,
      precioMax: this.precioMax,
      filtrosAvanzados: this.filtrosAvanzados
    });
  }

  toggleFiltros() {
    this.filtrosAvanzados = !this.filtrosAvanzados;
  }

  agregarAlCarrito(producto: any) {
    this.carrito.push(producto);
    this.mostrarCarrito = true;
    console.log('🛒 Añadido al carrito:', producto);
  }

  removerDelCarrito(producto: any) {
    const index = this.carrito.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      this.carrito.splice(index, 1);
      console.log('🗑️ Eliminado del carrito:', producto);
    }
  }

  cerrarCarrito() {
    this.mostrarCarrito = false;
  }

  calcularTotal(): number {
    return this.carrito.reduce((total, item) => total + item.precio, 0);
  }

  irAPagar() {
    alert('¡Gracias por tu compra! Próximamente conectaremos el pago.');
  }

  navegarAHome() {
    this.router.navigate(['/home']);
  }

  toggleSidebar() {
    this.sidebarAbierto = !this.sidebarAbierto;
  }
}
