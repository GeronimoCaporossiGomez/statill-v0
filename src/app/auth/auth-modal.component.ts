
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
  loading = false;

  constructor(private router: Router, private authService: AuthService) {}

  toggleMode(value: boolean) {
    this.isLogin = value;
    this.message = '';
  }

  submitForm() {
    this.message = '';
    this.loading = true;
    if (this.isLogin) {
      // Check credentials locally before attempting login
      this.authService.getUsers().subscribe({
        next: (res: any) => {
          const users = res.data || res;
          const user = users.find((u: any) => u.email === this.email && u.password === this.password);
          if (user) {
            this.loading = false;
            this.close.emit();
            this.router.navigate(['/home']);
          } else {
            this.loading = false;
            alert('Email o contraseña incorrectos.');
          }
        },
        error: (err) => {
          this.loading = false;
          alert('Error al verificar usuarios.');
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
          this.message = 'Registro exitoso. Ahora puede iniciar sesión.';
          this.toggleMode(true);
        },
        error: (err) => {
          this.loading = false;
          this.message = 'Error al registrarse. Revise los datos ingresados.';
        }
      });
    }
  }
}
