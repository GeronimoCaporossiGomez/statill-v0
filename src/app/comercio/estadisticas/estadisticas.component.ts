import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';
import { StatisticsService } from 'src/app/servicios/stats.service';
import { AuthService } from 'src/app/servicios/auth.service';

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
  user_id: number;
  store_id: number;
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
  @ViewChild('chartCanvas', { static: true })
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  private statisticsService = inject(StatisticsService);
  private authService = inject(AuthService);
  private chart?: Chart;

  products: Product[] = [];
  stores: any[] = [];
  productControl = new FormControl('');
  storeControl = new FormControl('');
  startDateControl = new FormControl('');
  endDateControl = new FormControl('');
  statTypeControl = new FormControl('ventas_en_el_tiempo');

  ngOnInit(): void {
    // Verificar que el usuario tenga una tienda
    const storeId = this.authService.getStoreId();
    if (!storeId) {
      console.error('Usuario no tiene tienda asociada');
      return;
    }

    // ✅ Cargar solo los productos de MI tienda usando el endpoint correcto
    this.statisticsService.getMyStoreProducts(storeId).subscribe({
      next: (res: any) => {
        this.products = res.data;
      },
      error: (err) => console.error('Error al obtener productos de mi tienda', err),
    });

    // Ya no es necesario cargar todas las tiendas
    // Solo mostraremos estadísticas de la tienda del usuario
    this.statisticsService.getStoresStats().subscribe({
      next: (res: any) => {
        // Filtrar solo la tienda del usuario
        this.stores = res.data.filter((s: any) => s.id === storeId);
      },
      error: (err) => console.error('Error al obtener tiendas', err),
    });

    // Establecer fechas por defecto (desde hace un mes hasta hoy)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);

    const formatoFecha = (fecha: Date): string => {
      return fecha.toISOString().split('T')[0];
    };

    this.startDateControl.setValue(formatoFecha(haceUnMes));
    this.endDateControl.setValue(formatoFecha(hoy));

    this.productControl.valueChanges.subscribe(() => this.cargarVentas());
    this.storeControl.valueChanges.subscribe(() => this.cargarVentas());
    this.startDateControl.valueChanges.subscribe(() => this.cargarVentas());
    this.endDateControl.valueChanges.subscribe(() => this.cargarVentas());
    this.statTypeControl.valueChanges.subscribe(() => this.cargarVentas());
  }

  cargarVentas() {
    const productId = this.productControl.value;
    const storeId = this.storeControl.value;
    const start = this.startDateControl.value;
    const end = this.endDateControl.value;
    const tipo = this.statTypeControl.value;

    if (
      (tipo === 'ganancias_por_producto' && !productId) ||
      (tipo === 'fidelidad_clientes' && !storeId) ||
      (!productId &&
        tipo !== 'ganancias_por_producto' &&
        tipo !== 'fidelidad_clientes')
    ) {
      this.destruirGrafico();
      return;
    }

    // ✅ CAMBIO PRINCIPAL: Usar getMyStoreSales() en lugar de getSalesStats()
    this.statisticsService.getMyStoreSales().subscribe({
      next: (res: any) => {
        let ventas = res.data as Sale[];
        
        // Filtrar por fecha si hay fechas seleccionadas
        if (start || end) {
          ventas = ventas.filter((venta) => {
            const date = new Date(venta.timestamp);
            const isoDate = date.toISOString().slice(0, 10);
            if (start && isoDate < start) return false;
            if (end && isoDate > end) return false;
            return true;
          });
        }

        if (tipo === 'ventas_en_el_tiempo') {
          this.mostrarVentasEnElTiempo(ventas, +productId!, start, end);
        } else if (tipo === 'metodos_pago') {
          this.mostrarMetodoDePago(ventas, +productId!);
        } else if (tipo === 'productos_junto') {
          this.mostrarProductosJunto(ventas, +productId!);
        } else if (tipo === 'ganancias_por_producto') {
          this.mostrarGananciasPorProducto(ventas, +productId!);
        } else if (tipo === 'fidelidad_clientes') {
          this.mostrarFidelidadClientes(ventas, +storeId!);
        }
      },
      error: (err) => {
        console.error('Error al cargar ventas de mi tienda', err);
        this.destruirGrafico();
      },
    });
  }

  mostrarGananciasPorProducto(sales: Sale[], productId: number) {
    // Sumar cantidad * precio solo para el producto seleccionado
    let total = 0;
    let prodName = '';
    sales.forEach((venta) => {
      venta.products.forEach((p) => {
        if (p.product_id === productId) {
          const prod = this.products.find((prod) => prod.id === p.product_id);
          if (prod) {
            total += p.quantity * prod.stock; // stock como precio
            prodName = prod.name;
          }
        }
      });
    });
    this.renderChart('bar', {
      labels: [prodName],
      datasets: [
        {
          label: 'Ganancias del Producto',
          data: [total],
          backgroundColor: ['#fd2a2c'],
        },
      ],
    });
  }

  mostrarFidelidadClientes(sales: Sale[], storeId: number) {
    // Calcular gasto promedio por cliente en la tienda
    const clientes: Record<number, number[]> = {};
    sales.forEach((venta) => {
      if (!venta.user_id) return;
      let totalVenta = 0;
      venta.products.forEach((p) => {
        const prod = this.products.find((prod) => prod.id === p.product_id);
        if (prod) {
          totalVenta += p.quantity * prod.stock; // stock como precio
        }
      });
      if (!clientes[venta.user_id]) clientes[venta.user_id] = [];
      clientes[venta.user_id].push(totalVenta);
    });
    const clientIds = Object.keys(clientes);
    const data = clientIds.map((id) => {
      const sum = clientes[+id].reduce((a, b) => a + b, 0);
      return sum / clientes[+id].length || 0;
    });
    this.renderChart('bar', {
      labels: clientIds.map((id) => `Cliente ${id}`),
      datasets: [
        {
          label: 'Gasto promedio por cliente',
          data,
          backgroundColor: clientIds.map((_, i) => `hsl(${i * 50}, 70%, 60%)`),
        },
      ],
    });
  }

  mostrarVentasEnElTiempo(
    sales: Sale[],
    productId: number,
    start?: string | null,
    end?: string | null,
  ) {
    const ventasPorFecha: Record<string, number> = {};

    sales.forEach((venta) => {
      const date = new Date(venta.timestamp);
      if (isNaN(date.getTime())) return;
      const isoDate = date.toISOString().slice(0, 10);

      if (start && isoDate < start) return;
      if (end && isoDate > end) return;

      const producto = venta.products.find((p) => p.product_id === productId);
      if (producto) {
        ventasPorFecha[isoDate] =
          (ventasPorFecha[isoDate] || 0) + producto.quantity;
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
      const contieneProducto = venta.products.some(
        (p) => p.product_id === productId,
      );
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
      const incluyeSeleccionado = venta.products.some(
        (p) => p.product_id === productId,
      );
      if (!incluyeSeleccionado) return;

      venta.products.forEach((p) => {
        if (p.product_id !== productId) {
          const nombre =
            this.products.find((prod) => prod.id === p.product_id)?.name ||
            `ID ${p.product_id}`;
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
          backgroundColor: Object.keys(conteo).map(
            (_, i) => `hsl(${i * 50}, 70%, 60%)`,
          ),
        },
      ],
    });
  }

  metodoPagoToString(metodo: number): string {
    switch (metodo) {
      case 0:
        return 'Efectivo';
      case 1:
        return 'Débito';
      case 2:
        return 'Crédito';
      case 3:
        return 'QR';
      default:
        return 'Otro';
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