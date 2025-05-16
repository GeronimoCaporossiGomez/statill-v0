import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  productos = [
    { nombre: 'Pan artesanal', precio: 450, img: 'assets/img/pan.jpg' },
    { nombre: 'Queso de campo', precio: 1250, img: 'assets/img/queso.jpg' },
    { nombre: 'Mermelada casera', precio: 800, img: 'assets/img/mermelada.jpg' }
  ];
}
