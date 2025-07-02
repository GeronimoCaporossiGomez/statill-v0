import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderStatillComponent } from "../../Componentes/header-statill/header-statill.component";

@Component({
  selector: 'app-crear-comercio',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderStatillComponent, RouterLink],
  templateUrl: './crear-comercio.component.html',
  styleUrl: './crear-comercio.component.scss'
})
export class CrearComercioComponent {
  creando:boolean = true;
  seccionPantalla:number = 0
  dias: string[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

  aumentarPantalla() {
    this.seccionPantalla += 1;
  }

  bajarPantalla() {
    this.seccionPantalla -= 1;
    if (this.seccionPantalla < 0) {
      this.seccionPantalla = 0;
    }
  }

  creandoComercio() {
    this.creando = !this.creando;
  }
  constructor(private router: Router) {}

  onSubmit(form: any) {
  console.log(form.value);
  this.router.navigate(['/escanear']);
  }
}
