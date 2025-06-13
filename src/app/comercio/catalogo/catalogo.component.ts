import { Component } from '@angular/core';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ComercioHeaderComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent {

}
