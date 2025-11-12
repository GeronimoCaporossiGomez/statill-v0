import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { authGuard } from 'src/app/core/guards/auth.guard';

@Component({
  selector: 'app-header-statill',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-statill.component.html',
  styleUrl: './header-statill.component.scss',
})
export class HeaderStatillComponent {
  menuAbierto = false;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
}
