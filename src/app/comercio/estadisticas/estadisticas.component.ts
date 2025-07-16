import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';
import { StatisticsService } from 'src/app/servicios/stats.service';

Chart.register(...registerables);

interface Product {
  id: number;
  name: string;
  stock: number;
}

interface SaleProduct {
  product_id: number;
  quantity: number;
}

interface Sale {
  id: number;
  timestamp: string;
  payment_method: number;
  products: SaleProduct[];
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
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
  statTypeControl = new FormControl('ventas_en_el_tiempo');

  ngOnInit(): void {
    this.statisticsService.getProductsStats().subscribe({
      next: (res: any) => (this.products = res.data),
      error: (err) => console.error('Error al obtener productos', err),
    });

    this.productControl.valueChanges.subscribe(() => this.cargarVentas());
    this.startDateControl.valueChanges.subscribe(() => this.cargarVentas());
    this.endDateControl.valueChanges.subscribe(() => this.cargarVentas());
    this.statTypeControl.valueChanges.subscribe(() => this.cargarVentas());
  }

  cargarVentas() {
    const productId = this.productControl.value;
    const start = this.startDateControl.value;
    const end = this.endDateControl.value;
    const tipo = this.statTypeControl.value;

    if (!productId) {
      this.destruirGrafico();
      return;
    }

    this.statisticsService.getSalesStats().subscribe({
      next: (res: any) => {
        const ventas = res.data as Sale[];
        if (tipo === 'ventas_en_el_tiempo') {
          this.mostrarVentasEnElTiempo(ventas, +productId, start, end);
        } else if (tipo === 'metodos_pago') {
          this.mostrarMetodoDePago(ventas, +productId);
        } else if (tipo === 'productos_junto') {
          this.mostrarProductosJunto(ventas, +productId);
        }
      },
      error: (err) => {
        console.error('Error al cargar ventas', err);
        this.destruirGrafico();
      },
    });
  }

  mostrarVentasEnElTiempo(sales: Sale[], productId: number, start?: string, end?: string) {
    const ventasPorFecha: Record<string, number> = {};

    sales.forEach((venta) => {
      const date = new Date(venta.timestamp);
      if (isNaN(date.getTime())) return;
      const isoDate = date.toISOString().slice(0, 10);

      if (start && isoDate < start) return;
      if (end && isoDate > end) return;

      const producto = venta.products.find((p) => p.product_id === productId);
      if (producto) {
        ventasPorFecha[isoDate] = (ventasPorFecha[isoDate] || 0) + producto.quantity;
      }
    });

    const labels = Object.keys(ventasPorFecha).sort();
    const data = labels.map((f) => ventasPorFecha[f]);

    this.renderChart('line', {
      labels,
      datasets: [
        {
          label: 'Cantidad Vendida',
          data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    });
  }

  mostrarMetodoDePago(sales: Sale[], productId: number) {
    const metodos: Record<string, number> = {};

    sales.forEach((venta) => {
      const contieneProducto = venta.products.some((p) => p.product_id === productId);
      if (contieneProducto) {
        const metodo = this.metodoPagoToString(venta.payment_method);
        metodos[metodo] = (metodos[metodo] || 0) + 1;
      }
    });

    this.renderChart('pie', {
      labels: Object.keys(metodos),
      datasets: [
        {
          label: 'Métodos de Pago',
          data: Object.values(metodos),
          backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
        },
      ],
    });
  }

  mostrarProductosJunto(sales: Sale[], productId: number) {
    const conteo: Record<string, number> = {};

    sales.forEach((venta) => {
      const incluyeSeleccionado = venta.products.some((p) => p.product_id === productId);
      if (!incluyeSeleccionado) return;

      venta.products.forEach((p) => {
        if (p.product_id !== productId) {
          const nombre = this.products.find((prod) => prod.id === p.product_id)?.name || `ID ${p.product_id}`;
          conteo[nombre] = (conteo[nombre] || 0) + p.quantity;
        }
      });
    });

    this.renderChart('pie', {
      labels: Object.keys(conteo),
      datasets: [
        {
          label: 'Productos vendidos junto al seleccionado',
          data: Object.values(conteo),
          backgroundColor: Object.keys(conteo).map((_, i) => `hsl(${i * 50}, 70%, 60%)`),
        },
      ],
    });
  }

  metodoPagoToString(metodo: number): string {
    switch (metodo) {
      case 1: return 'Efectivo';
      case 2: return 'Débito';
      case 3: return 'Crédito';
      default: return 'Otro';
    }
  }

  private renderChart(type: ChartType, data: any) {
    this.destruirGrafico();
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    this.chart = new Chart(ctx, {
      type,
      data,
      options: { responsive: true },
    });
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
