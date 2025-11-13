import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Discount, MiApiService, Product, ProductsResponse, Store } from 'src/app/servicios/mi-api.service';

@Component({
  selector: 'app-discounts-statill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Discounts-statill.component.html',
  styleUrls: ['./Discounts-statill.component.scss'],
})
export class DiscountsStatillComponent {
  @Input() d: Discount;
  private product: Product;
  public store: Store;
  public img: string;
  private readonly api = inject(MiApiService);
  ngOnInit(){
    this.api.getProducto(this.d.product_id).subscribe({
      next: (r)=>{
        this.product = r.data;
        this.api.getStoreById(this.product.store_id).subscribe({
          next: (r)=>{
            this.store = r.data;
            
          }
        })
      },
    })
  }
}
