import { Router } from '@angular/router';
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
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
        animate('300ms ease-out'),
      ]),
    ]),
  ],
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();

  isLogin = true;
  // Registration fields
  first_names = '';
  last_name = '';
  email = '';
  password = '';
  birthdate = '';
  gender = '';
  res_area = '';

  // For error/success messages
  message = '';
  messageType: 'success' | 'error' | '' = '';
  loading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  toggleMode(value: boolean) {
    this.isLogin = value;
    this.message = '';
    this.messageType = '';
    // reset fields
  }

  submitForm() {
    this.message = '';
    this.messageType = '';
    this.loading = true;
    if (this.isLogin) {
      // Login with email and password
      this.authService
        .requestToken({
          grant_type: 'password',
          username: this.email,
          password: this.password,
        })
        .subscribe({
          next: (response) => {
            this.loading = false;
            // Check if user needs to verify email
            const user = this.authService.getCurrentUser();
            if (user && !user.email_verified) {
              this.message =
                'Por favor, verifique su email antes de continuar.';
              this.messageType = 'error';
              // send verification code and redirect to confirmation route
              this.authService.sendEmailVerificationCode().subscribe({
                next: () => {
                  this.close.emit();
                  this.router.navigate(['/confirmacion-codigo']);
                },
                error: () => {
                  // even if sending fails, still navigate so user can try
                  this.close.emit();
                  this.router.navigate(['/confirmacion-codigo']);
                },
              });
            } else {
              this.message = '¡Bienvenido!';
              this.messageType = 'success';
              setTimeout(() => {
                this.close.emit();
                this.router.navigate(['/home']);
              }, 1000);
            }
          },
          error: (err) => {
            this.loading = false;
            this.message =
              err.error?.message ||
              'Error de autenticación. Verifique el email y la contraseña.';
            this.messageType = 'error';
          },
        });
    } else {
      // Register new user
      this.authService
        .registerUser({
          first_names: this.first_names,
          last_name: this.last_name,
          email: this.email,
          password: this.password,
          birthdate: this.birthdate,
          gender: this.gender,
          res_area: this.res_area,
        })
        .subscribe({
          next: (res) => {
            this.loading = false;
            this.message =
              'Registro exitoso. Se ha enviado un código de verificación a tu email.';
            this.messageType = 'success';
            // Close modal and redirect to confirmation page
            this.close.emit();
            this.router.navigate(['/confirmacion-codigo']);
          },
          error: (err) => {
            this.loading = false;
            this.message =
              err.error?.message ||
              'Error al registrarse. Revise los datos ingresados.';
            this.messageType = 'error';
          },
        });
    }
  }
}
