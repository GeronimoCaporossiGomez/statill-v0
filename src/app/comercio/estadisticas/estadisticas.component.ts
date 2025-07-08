import {
  Component,
  OnInit,
  inject
} from '@angular/core';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';
import { CommonModule } from '@angular/common';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';
import { StatisticsService } from 'src/app/servicios/stats.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [ComercioHeaderComponent, CommonModule, HeaderStatillComponent],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export class EstadisticasComponent implements OnInit {
  productos: { nombre: string; cantidad: number }[] = [];

  private statsService = inject(StatisticsService);

  ngOnInit(): void {
    this.statsService.getProductsStats().subscribe({
      next: (productos) => {
        // Aquí se asegura que productos tenga el formato esperado
        this.productos = productos.map(p => ({
          nombre: p.nombre,
          cantidad: p.cantidad
        }));
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }
}
