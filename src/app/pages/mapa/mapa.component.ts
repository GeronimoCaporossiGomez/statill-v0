import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';

@Component({
  selector: 'app-mapa',
  imports: [CommonModule, HeaderStatillComponent],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss'
})
export class MapaComponent {

}
