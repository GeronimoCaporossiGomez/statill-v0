import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { provideRouter, Router } from '@angular/router';
import { ComercioService } from '../servicios/comercio.service';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '../app.routes';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, HeaderStatillComponent],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss'],
})
export class ConfiguracionComponent implements OnInit {
  private router = inject(Router);
  private comercioService = inject(ComercioService);

  comercios: any[] = [];
  cargando = true;

  ngOnInit() {
    this.comercioService.getStores().subscribe({
      next: (stores) => {
        this.comercios = stores;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar tiendas:', err);
        this.cargando = false;
      }
    });
  }

  irAComercio(id: number) {
    this.router.navigate(['/negocio', id]);
  }
}
