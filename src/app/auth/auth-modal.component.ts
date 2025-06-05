import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importamos FormsModule para usar ngModel
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

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
  name = '';
  email = '';
  password = '';

  toggleMode(value: boolean) {
    this.isLogin = value;
  }

  submitForm() {
    const data = {
      email: this.email,
      password: this.password,
      ...(this.isLogin ? {} : { name: this.name })
    };

    console.log(this.isLogin ? 'Login exitoso:' : 'Registro completo:', data);
    this.close.emit();
  }
}