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
  // verification UI removed
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

  constructor(private router: Router, private authService: AuthService) {}

  toggleMode(value: boolean) {
    this.isLogin = value;
    this.message = '';
    this.messageType = '';
  }

  // Handler for the main button: if registering, navigate to confirmation page;
  // if login, proceed with login flow.
  onSubmitButton(event: Event) {
    event.preventDefault();
    if (!this.isLogin) {
      // registro -> cerrar modal y redirigir a confirmacion-codigo con email
      this.loading = false;
      this.close.emit();
      this.router.navigate(['/confirmacion-codigo'], { queryParams: { email: this.email } });
      return;
    }
    // login -> ejecutar flujo normal
    this.submitForm();
  }

  submitForm() {
    this.message = '';
    this.messageType = '';
    this.loading = true;

    // Login flow
    this.authService
      .requestToken({
        grant_type: 'password',
        username: this.email,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.loading = false;
          const user = this.authService.getCurrentUser?.() ?? null;
          if (user && !user.email_verified) {
            this.message = 'Por favor, verifique su email antes de continuar.';
            this.messageType = 'error';
            // keep user in login state (verification handled outside modal)
            // optionally trigger resend
            this.authService.sendEmailVerificationCode?.().subscribe?.();
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
  }

  // keep resend method in case it's used elsewhere
  resendVerificationCode() {
    this.loading = true;
    this.authService.sendEmailVerificationCode?.().subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Código de verificación reenviado exitosamente.';
        this.messageType = 'success';
      },
      error: () => {
        this.loading = false;
        this.message = 'Error al reenviar el código. Por favor, intente nuevamente.';
        this.messageType = 'error';
      },
    });
  }
}
