import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject
} from '@angular/core';
import Chart from 'chart.js/auto';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';
import { CommonModule } from '@angular/common';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';
import { StatisticsService } from 'src/app/servicios/stats.service'; // Asegúrate de la ruta correcta

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [ComercioHeaderComponent, CommonModule, HeaderStatillComponent],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss',
})
export class EstadisticasComponent implements AfterViewInit {
  @ViewChild('productChart') chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  private statsService = inject(StatisticsService);

  ngAfterViewInit(): void {
    this.statsService.getProductsStats().subscribe({
      next: (productos) => this.initChart(productos),
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  initChart(productos: any[]): void {
    const labels = productos.map(p => p.nombre);
    const data = productos.map(p => p.cantidad);

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Cantidad de productos',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}
