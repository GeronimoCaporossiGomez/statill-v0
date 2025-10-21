import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';
import { DiscountsStatillComponent } from 'src/app/Componentes/Discounts-statill/Discounts-statill.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgFor, HeaderStatillComponent, DiscountsStatillComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  promotions = [
    {
      id: 1,
      storeName: 'hola en nombre',
      discountText: 'soy un descuento',
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSidAa0zo1VuvqjZCs18V_DlFovbjc17c964w&s'
    },
    {
      id: 2,
      storeName: 'Kioscos EL JEVI',
      discountText: 'Preordená con 20% OFF en kioscos EL JEVI',
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSidAa0zo1VuvqjZCs18V_DlFovbjc17c964w&s'
    },
        {
      id: 3,
      storeName: 'ESO',
      discountText: 'Preordená con 20% OFF en ESO',
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSidAa0zo1VuvqjZCs18V_DlFovbjc17c964w&s'
    },
            {
      id: 4,
      storeName: 'EJEMPLO',
      discountText: 'Preordená con 20% OFF en EJEMPLO',
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSidAa0zo1VuvqjZCs18V_DlFovbjc17c964w&s'
    },
  ];

  constructor() { }
  ngOnInit(): void { }
}