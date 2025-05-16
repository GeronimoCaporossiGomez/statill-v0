import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent {
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  exito = false;

  constructor(private auth: AuthService, private router: Router) {}

  registrar(): void {
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    const registrado = this.auth.register(this.email, this.password);
    if (registrado) {
      this.exito = true;
      setTimeout(() => this.router.navigate(['/home']), 1500);
    } else {
      this.error = 'El usuario ya existe.';
    }
  }
}
