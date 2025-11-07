import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discounts-statill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Discounts-statill.component.html',
  styleUrls: ['./Discounts-statill.component.scss'],
})
export class DiscountsStatillComponent {
  @Input() logoUrl: string = '';
  @Input() storeName: string = '';
  @Input() discountText: string = '';
}
