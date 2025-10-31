
import { Router } from '@angular/router';
import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  animations: [
    trigger('fadeSlide', [
      state('login', style({ opacity: 1, transform: 'translateY(0)' })),
      state('register', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('login <=> register', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out')
      ])
    ])
  ]
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();

  isLogin = true;
  isVerifyingCode = false;
  // Registration fields
  first_names = '';
  last_name = '';
  email = '';
  password = '';
  birthdate = '';
  gender = '';
  res_area = '';
  activationCode = '';

  // For error/success messages
  message = '';
  loading = false;

  constructor(private router: Router, private authService: AuthService) {}

  toggleMode(value: boolean) {
    this.isLogin = value;
    this.message = '';
    this.isVerifyingCode = false;
    this.activationCode = '';
  }

  submitForm() {
    this.message = '';
    this.loading = true;
    if (this.isVerifyingCode) {
      // Submit activation code to activation endpoint
      this.authService.activateAccount(this.activationCode).subscribe({
        next: () => {
          // Después de activar, loguearse automáticamente con el código
          this.authService.requestToken({
            grant_type: 'password',
            username: this.email,
            password: this.activationCode,
          }).subscribe({
            next: () => {
              this.loading = false;
              this.close.emit();
              this.router.navigate(['/home']);
            },
            error: () => {
              this.loading = false;
              alert('Cuenta activada, pero falló el login automático. Inicie sesión manualmente.');
              this.router.navigate(['/confirmacion-codigo']);
            }
          });
        },
        error: () => {
          this.loading = false;
          alert('Código inválido. Reintente.');
        }
      });
    } else if (this.isLogin) {
      // Token-based login: use activation code as password
      this.authService.requestToken({
        grant_type: 'password',
        username: this.email,
        password: this.password,
      }).subscribe({
        next: () => {
          this.loading = false;
          this.close.emit();
          this.router.navigate(['/home']);
        },
        error: () => {
          this.loading = false;
          alert('Error de autenticación. Verifique el email y el código.');
        }
      });
    } else {
      // Register logic
      this.authService.registerUser({
        first_names: this.first_names,
        last_name: this.last_name,
        email: this.email,
        password: this.password,
        birthdate: this.birthdate,
        gender: this.gender,
        res_area: this.res_area
      }).subscribe({
        next: (res) => {
          this.loading = false;
          this.message = 'Registro exitoso. Ingresá el código que te enviamos.';
          // Mantener email cargado y pasar a verificación de código
          this.isVerifyingCode = true;
        },
        error: (err) => {
          this.loading = false;
          this.message = 'Error al registrarse. Revise los datos ingresados.';
        }
      });
    }
  }
}
