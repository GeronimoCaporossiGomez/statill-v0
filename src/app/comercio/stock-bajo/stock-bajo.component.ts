import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-bajo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-bajo.component.html',
  styleUrls: ['./stock-bajo.component.scss']
})
export class StockBajoComponent {
  productosConPocoStock = [
    { nombre: 'Pan integral', stock: 3 },
    { nombre: 'Leche entera', stock: 6 },
    { nombre: 'Queso cremoso', stock: 2 }
  ];
}
