import { Component } from '@angular/core';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-escanear',
  standalone: true,
  imports: [ComercioHeaderComponent, CommonModule],
  templateUrl: './escanear.component.html',
  styleUrl: './escanear.component.scss'
})
export class EscanearComponent {

}
