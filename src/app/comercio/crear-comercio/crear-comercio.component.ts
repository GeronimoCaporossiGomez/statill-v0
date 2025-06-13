import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-comercio',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './crear-comercio.component.html',
  styleUrl: './crear-comercio.component.scss'
})
export class CrearComercioComponent {
  creando:boolean = false;
  dias: string[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

  creandoComercio() {
    this.creando = !this.creando;
  }
  constructor(private router: Router) {}

  onSubmit(form: any) {
  console.log(form.value);
  this.router.navigate(['/escanear']);
}
}
