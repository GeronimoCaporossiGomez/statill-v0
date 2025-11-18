import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Discount,
  MiApiService,
  Product,
  //ProductsResponse,
  Store,
} from 'src/app/servicios/mi-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-discounts-statill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Discounts-statill.component.html',
  styleUrls: ['./Discounts-statill.component.scss'],
})
export class DiscountsStatillComponent implements OnInit {
  @Input() d: Discount;
  private product: Product;
  public store: Store | undefined;
  public img: string | undefined;
  private readonly api = inject(MiApiService);
  public text: string | undefined;
  public isLoaded: boolean = false;

  constructor(private router: Router){
  }

  ngOnInit() {
    this.loadDiscountData();
  }

  private loadDiscountData(): void {
    this.api.getProducto(this.d.product_id).subscribe({
      next: (r: any) => {
        this.product = r.data;
        this.api.getStoreById(this.product.store_id).subscribe({
          next: (r: any) => {
            this.store = r.data;
            this.api.getImageByObjectId('product', this.product.id).subscribe({
              next: (r: any) => {
                this.img = r.data;
                this.text = `${this.d.pct_off}% OFF en ${this.product.name}`;
                this.isLoaded = true;
              },
              error: () => {
                this.isLoaded = true;
              },
            });
          },
        });
      },
    });
  }


  handleClick(){
    //abre la tienda correspondiente onclick

    this.router.navigate([`/negocio/${this.product.store_id}`])
  }
}
