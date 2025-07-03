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
    if(this.seccionPantalla > 3) {
      this.seccionPantalla = 3;
    }
  }

  bajarPantalla() {
    this.seccionPantalla -= 1;
    if (this.seccionPantalla < 0) {
      this.seccionPantalla = 0;
    }
  }

  creandoComercio(x: boolean) {
    this.creando = x
  }
  constructor(private router: Router) {}

  onSubmit(form: any) {
  console.log(form.value);
  this.router.navigate(['/escanear']);
  }

    imagenUrl: string | ArrayBuffer | null = null;

  mostrarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => this.imagenUrl = reader.result;
      reader.readAsDataURL(input.files[0]);
    }
  }
}
