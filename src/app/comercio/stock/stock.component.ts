import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { stockComponent } from 'src/app/comercio/stock/stock.component';

@Component({
  selector: 'stock',
  imports: [CommonModule, stockComponent],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss'
})
export class MapaComponent {

}
