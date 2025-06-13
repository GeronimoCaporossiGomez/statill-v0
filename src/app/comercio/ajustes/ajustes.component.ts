import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderStatillComponent } from 'src/app/header-statill/header-statill.component';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule, ComercioHeaderComponent, HeaderStatillComponent],
  templateUrl: './ajustes.component.html',
  styleUrl: './ajustes.component.scss'
})
export class AjustesComponent {

}
