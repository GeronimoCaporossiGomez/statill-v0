import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderStatillComponent } from '../Componentes/header-statill/header-statill.component';
import { Router } from '@angular/router';
import { ComercioService } from '../servicios/comercio.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, HeaderStatillComponent],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss'],
})
export class ConfiguracionComponent{
  private router = inject(Router);
  private comercioService = inject(ComercioService);

  comercios: any[] = this.comercioService.getComercios();

  irAComercio(id: string) {
    this.router.navigate(['/negocio', id]);
  }
}
