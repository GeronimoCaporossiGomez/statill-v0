import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComercioService } from '../servicios/comercio.service';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';

@Component({
  selector: 'app-negocio',
  imports: [CommonModule, HeaderStatillComponent],
  templateUrl: './negocio.component.html',
  styleUrl: './negocio.component.scss',
})
export class NegocioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comercioService = inject(ComercioService);

  comercio: any;
  productos: any[] = [];
  cargando = true;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Cargar la tienda
    this.comercioService.getStoreById(id).subscribe({
      next: (store) => {
        this.comercio = store;
      },
      error: (err) => {
        console.error('Error al cargar tienda:', err);
      }
    });

    // Cargar productos de la tienda
    this.comercioService.getProductosByStore(id).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.cargando = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/configuracion']);
  }
}
