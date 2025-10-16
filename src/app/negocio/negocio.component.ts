import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComercioService } from '../servicios/comercio.service';

@Component({
  selector: 'app-negocio',
  imports: [CommonModule],
  templateUrl: './negocio.component.html',
  styleUrl: './negocio.component.scss',
})

export class NegocioComponent implements OnInit{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comercioService = inject(ComercioService);

  comercio?: any;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.comercio = this.comercioService.getComercioById(id);
    }
  }
}
