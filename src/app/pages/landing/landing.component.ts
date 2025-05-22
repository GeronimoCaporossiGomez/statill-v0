import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 👈 Necesario para routerLink

@Component({
  standalone: true,
  selector: 'app-landing',
  imports: [CommonModule, RouterModule], // 👈 Agregado RouterModule acá
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingPageComponent {}
