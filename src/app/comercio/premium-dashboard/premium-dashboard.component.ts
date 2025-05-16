import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-premium-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-dashboard.component.html',
  styleUrls: ['./premium-dashboard.component.scss']
})
export class PremiumDashboardComponent {
  chart: any;

  ngAfterViewInit(): void {
    this.chart = new Chart('zonaChart', {
      type: 'bar',
      data: {
        labels: ['Centro', 'Palermo', 'Villa Urquiza', 'Recoleta', 'San Telmo'],
        datasets: [{
          label: 'Ventas por zona',
          data: [150, 120, 100, 80, 50],
          backgroundColor: '#4caf50'
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
