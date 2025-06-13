import { Component } from '@angular/core';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';
import { CommonModule } from '@angular/common';
import { HeaderStatillComponent } from 'src/app/header-statill/header-statill.component';

@Component({
  selector: 'app-escanear',
  standalone: true,
  imports: [ComercioHeaderComponent, CommonModule, HeaderStatillComponent],
  templateUrl: './escanear.component.html',
  styleUrl: './escanear.component.scss'
})
export class EscanearComponent {

}
