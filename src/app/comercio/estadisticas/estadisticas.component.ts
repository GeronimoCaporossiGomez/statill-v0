import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StatisticsService } from 'src/app/servicios/stats.service';

Chart.register(...registerables);

interface Product {
  id: number;
  name: string;
}

interface SaleProduct {
  product_id: number;
  quantity: number;
}

interface Sale {
  id: number;
  timestamp: string;
  products: SaleProduct[];
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss'],
})
export class EstadisticasComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private statisticsService = inject(StatisticsService);
  private chart?: Chart;

  products: Product[] = [];
  productControl = new FormControl('');
  startDateControl = new FormControl('');
  endDateControl = new FormControl('');

  ngOnInit(): void {
    this.statisticsService.getProductsStats().subscribe({
      next: (res: any) => {
        this.products = res.data;
      },
      error: (err) => {
        console.error('Error al obtener productos', err);
      },
    });

    this.productControl.valueChanges.subscribe(() => this.cargarVentas());
    this.startDateControl.valueChanges.subscribe(() => this.cargarVentas());
    this.endDateControl.valueChanges.subscribe(() => this.cargarVentas());
  }

  cargarVentas() {
    const productId = this.productControl.value;
    const startDate = this.startDateControl.value;
    const endDate = this.endDateControl.value;

    if (!productId) {
      this.destruirGrafico();
      return;
    }

    this.statisticsService.getSalesStats().subscribe({
      next: (res: any) => this.actualizarGrafico(res.data, Number(productId), startDate, endDate),
      error: (err) => {
        console.error('Error al cargar ventas', err);
        this.destruirGrafico();
      },
    });
  }

  private actualizarGrafico(sales: Sale[], productId: number, start?: string, end?: string) {
    const ventasPorFecha: Record<string, number> = {};

    sales.forEach((venta) => {
      const date = new Date(venta.timestamp);
      if (isNaN(date.getTime())) return;

      const isoDate = date.toISOString().slice(0, 10); // YYYY-MM-DD

      // Filtrado por fecha si hay valores
      if (start && new Date(isoDate) < new Date(start)) return;
      if (end && new Date(isoDate) > new Date(end)) return;

      const producto = venta.products.find((p) => p.product_id === productId);
      if (producto) {
        ventasPorFecha[isoDate] = (ventasPorFecha[isoDate] || 0) + producto.quantity;
      }
    });

    const fechasOrdenadas = Object.keys(ventasPorFecha).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    const data = fechasOrdenadas.map((fecha) => ventasPorFecha[fecha]);

    this.destruirGrafico();

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: fechasOrdenadas,
        datasets: [
          {
            label: 'Cantidad Vendida',
            data: data,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private destruirGrafico() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  ngOnDestroy(): void {
    this.destruirGrafico();
  }
}
