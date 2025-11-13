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

  constructor(private router: Router, private authService: AuthService) {}

  toggleMode(value: boolean) {
    this.isLogin = value;
    this.message = '';
    this.messageType = '';
  }

  // Handler for the main button: if registering, perform registration then navigate;
  // if login, proceed with login flow.
  onSubmitButton(event: Event) {
    event.preventDefault();

    if (!this.isLogin) {
      // Registro: llamar a la API de registro, esperar respuesta y luego navegar a confirmacion-codigo
      this.message = '';
      this.messageType = '';
      this.loading = true;

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
            this.message = 'Registro exitoso. Se ha enviado un código de verificación a tu email.';
            this.messageType = 'success';

            // Intentar solicitar reenvío/envío explícito del código si el servicio lo expone
            const sendFn = (this.authService as any).sendEmailVerificationCode;
            if (typeof sendFn === 'function') {
              try {
                sendFn.call(this.authService, this.email).subscribe({
                  next: () => {
                    // no-op
                  },
                  error: () => {
                    // no-op
                  },
                });
              } catch {
                // ignore
              }
            }

            // Cerrar modal y navegar a la página de confirmación con email en query params
            this.close.emit();
            this.router.navigate(['/confirmacion-codigo'], { queryParams: { email: this.email } });
          },
          error: (err) => {
            this.loading = false;
            this.message =
              err?.error?.message ||
              err?.message ||
              'Error al registrarse. Revise los datos ingresados.';
            this.messageType = 'error';
          },
        });

      return;
    }

    // Si es login, ejecutar flujo normal
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
          const user = (this.authService as any).getCurrentUser?.() ?? null;
          if (user && !user.email_verified) {
            this.message = 'Por favor, verifique su email antes de continuar.';
            this.messageType = 'error';
            // opcional: reenviar código
            const sendFn = (this.authService as any).sendEmailVerificationCode;
            if (typeof sendFn === 'function') {
              try {
                sendFn.call(this.authService, this.email).subscribe();
              } catch {}
            }
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
            err?.error?.message ||
            err?.message ||
            'Error de autenticación. Verifique el email y la contraseña.';
          this.messageType = 'error';
        },
      });
  }

  resendVerificationCode() {
    this.loading = true;
    const sendFn = (this.authService as any).sendEmailVerificationCode;
    if (typeof sendFn === 'function') {
      try {
        sendFn.call(this.authService, this.email).subscribe({
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
      } catch {
        this.loading = false;
        this.message = 'No se pudo reenviar el código.';
        this.messageType = 'error';
      }
    } else {
      this.loading = false;
      this.message = 'Función de reenvío no disponible.';
      this.messageType = 'error';
    }
  }
}
