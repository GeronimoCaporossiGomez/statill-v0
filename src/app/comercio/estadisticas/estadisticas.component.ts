import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';
import { MiApiService } from 'src/app/servicios/mi-api.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, ComercioHeaderComponent, HeaderStatillComponent],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})
export class EstadisticasComponent implements OnInit {

  productos: { name: string; quantity: number; price: number; id: number; type: number; barcode: string; description: string }[] = [];

  // FEATURE: Preparación para gráfico de precios por tiempo
  // ventas: any[] = [];
  // chart: Chart | undefined;

  constructor(private miApi: MiApiService) {}

  ngOnInit(): void {
    console.log('Iniciando carga de productos...');
    this.miApi.getProductos().subscribe({
      next: (res: any) => {
        console.log('Respuesta API:', res);
        if (res.successful && Array.isArray(res.data)) {
          this.productos = res.data.map((p: any) => ({
            name: p.name,
            quantity: p.quantity,
            price: p.price,
            id: p.id,
            type: p.type,
            barcode: p.barcode,
            description: p.description,
          }));

          // FEATURE: Cargar ventas y generar gráfico
          /*
          this.miApi.getVentas().subscribe({
            next: (ventaRes: any) => {
              if (ventaRes.successful && Array.isArray(ventaRes.data)) {
                this.ventas = ventaRes.data;
                this.createChart();
              }
            },
            error: (err) => console.error('Error al cargar ventas', err)
          });
          */

        } else {
          this.productos = [];
        }
      },
      error: (err) => {
        console.error('Error al obtener productos', err);
        this.productos = [];
      }
    });
  }

  // FEATURE: Crear gráfico con precios por tiempo para cada producto
  /*
  createChart() {
    const grouped: { [productName: string]: { x: Date; y: number }[] } = {};

    this.ventas.forEach((venta: any) => {
      const producto = this.productos.find(p => p.id === venta.product_id);
      if (!producto || !venta.timestamp) return;

      const productName = producto.name;
      const dataPoint = {
        x: new Date(venta.timestamp),
        y: venta.sale_price
      };

      if (!grouped[productName]) {
        grouped[productName] = [];
      }
      grouped[productName].push(dataPoint);
    });

    const datasets = Object.keys(grouped).map(productName => ({
      label: productName,
      data: grouped[productName],
      fill: false,
      borderColor: this.getRandomColor(),
      tension: 0.1
    }));

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('priceChart', {
      type: 'line',
      data: {
        datasets
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Precio de productos en el tiempo'
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            },
            title: {
              display: true,
              text: 'Fecha'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Precio'
            }
          }
        }
      }
    });
  }

  getRandomColor(): string {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
  }
  
esta parte esta comentada porque no se ha implementado la API de ventas aún, pero está preparada para ser activada cuando esté disponible.
*/}
