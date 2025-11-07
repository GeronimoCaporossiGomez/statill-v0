import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-confirmation-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Confirm.component.html',
  styleUrls: ['./Confirm.component.scss'],
})
export class ConfirmComponent implements OnInit {
  activationCode = '';
  message = '';
  messageType: 'success' | 'error' | '' = '';
  loading = false;
  email = '';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Check if user is already authenticated and verified
    const user = this.authService.getCurrentUser();
    if (user?.email_verified) {
      // User is already verified, redirect to home
      this.router.navigate(['/home']);
      return;
    }

    // Get email from current user if authenticated
    if (user) {
      this.email = user.email;
    }
  }

  submitCode() {
    if (!this.activationCode.trim()) {
      this.message = 'Por favor, ingrese un código de verificación.';
      this.messageType = 'error';
      return;
    }

    this.loading = true;
    this.message = '';
    this.messageType = '';

    this.authService.activateAccount(this.activationCode).subscribe({
      next: () => {
        this.loading = false;
        this.message = '¡Cuenta activada exitosamente!';
        this.messageType = 'success';

        // Refresh user info and redirect after a short delay
        setTimeout(() => {
          this.authService.fetchCurrentUser().subscribe(() => {
            this.router.navigate(['/home']);
          });
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.message =
          err.error?.message ||
          'Código inválido. Por favor, verifique el código enviado a su email.';
        this.messageType = 'error';
      },
    });
  }

  resendCode() {
    this.loading = true;
    this.message = '';
    this.messageType = '';

    this.authService.sendEmailVerificationCode().subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Código de verificación reenviado exitosamente.';
        this.messageType = 'success';
      },
      error: (err) => {
        this.loading = false;
        this.message =
          'Error al reenviar el código. Por favor, intente nuevamente.';
        this.messageType = 'error';
      },
    });
  }

  goToApp() {
    // Check if user is verified before allowing access
    const user = this.authService.getCurrentUser();
    if (user?.email_verified) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/landing']);
    }
  }
}
