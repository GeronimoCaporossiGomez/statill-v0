import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';
import { MapaComponent } from 'src/app/mapa/mapa.component';

@Component({
  selector: 'app-mapa-pagina',
  imports: [CommonModule, HeaderStatillComponent, MapaComponent],
  templateUrl: './mapa-pagina.component.html',
  styleUrl: './mapa-pagina.component.scss',
})
export class MapaPaginaComponent {}
