import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarComponent } from "../Componentes/sidebar-statill/sidebar.component";
import { RouterLink, RouterModule } from "@angular/router";
import { HeaderStatillComponent } from "../Componentes/header-statill/header-statill.component";

@Component({
  selector: 'app-puntos',
  imports: [CommonModule, RouterLink, RouterModule, HeaderStatillComponent],
  templateUrl: './puntos.component.html',
  styleUrl: './puntos.component.scss'
})
export class PuntosComponent {

probando: any[] = [{ /* esto hay que conectarlo con el backend. */
  imagen: "https://i.pravatar.cc/150?img=3",
  nombre: "freddie verdury1",
  puntos: 1200,

},
{
  imagen: "https://i.pravatar.cc/150?img=5",
  nombre: "freddie verdury2",
  puntos: 1400,
},
{
  imagen: "https://i.pravatar.cc/150?img=8",
  nombre: "freddie verdury3",
  puntos: 1600,
}]

}
