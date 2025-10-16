import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderStatillComponent } from "../../Componentes/header-statill/header-statill.component";
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';

@Component({
  selector: 'app-crear-comercio',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterLink],
  templateUrl: './crear-comercio.component.html',
  styleUrl: './crear-comercio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearComercioComponent {
  creando: boolean = true;
  seccionPantalla: number = 0;
  dias: string[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  imagenUrl: string | ArrayBuffer | null = null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

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
    this.creando = x;
  }

  onSubmit(form: any) {
    console.log(form.value);
    this.router.navigate(['/escanear']);
  }

  mostrarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenUrl = reader.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}