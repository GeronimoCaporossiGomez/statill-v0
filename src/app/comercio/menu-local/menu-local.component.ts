import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-local',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-local.component.html',
  styleUrls: ['./menu-local.component.scss']
})
export class MenuLocalComponent {
  constructor(private router: Router) {}

  goTo(path: string) {
    this.router.navigate([path]);
  }
}
