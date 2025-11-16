import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../Componentes/sidebar-statill/sidebar.component';

@Component({
  selector: 'app-menu-local',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './menu-local.component.html',
  styleUrls: ['./menu-local.component.scss'],
})
export class MenuLocalComponent {
  constructor(private router: Router) {}

  goTo(path: string) {
    this.router.navigate([path]);
  }
}
