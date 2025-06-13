import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule, ComercioHeaderComponent],
  templateUrl: './ajustes.component.html',
  styleUrl: './ajustes.component.scss'
})
export class AjustesComponent {

}
