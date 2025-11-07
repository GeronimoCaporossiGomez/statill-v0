import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  sidebarAbierto = false;
  user: any = null;
  fullName: string = '';
  email: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Obtener usuario actual
    this.user = this.authService.getCurrentUser();

    if (this.user) {
      this.fullName = `${this.user.first_names} ${this.user.last_name}`;
      this.email = this.user.email;
    } else {
      // Si no hay usuario en cache, intentar obtenerlo
      this.authService.fetchCurrentUser().subscribe({
        next: () => {
          this.user = this.authService.getCurrentUser();
          if (this.user) {
            this.fullName = `${this.user.first_names} ${this.user.last_name}`;
            this.email = this.user.email;
          }
        },
      });
    }
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
