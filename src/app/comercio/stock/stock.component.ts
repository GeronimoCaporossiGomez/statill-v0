import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Cambiado a forms modulee
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';
import { MiApiService } from 'src/app/servicios/mi-api.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent], // Usar FormsModule para el ngmodel
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent {
  constructor(private miApi: MiApiService) {}

  SePuedeVerElformulario = false; // arranca escondidiwis
  product = { // Objeto para almacenar datos del formulario
    name: '',
    code: '',
    price: null,
    description: '',
    cantidad: null,
  };

  productos: any[] = []; // Array para almacenar los productos
  ngOnInit() {
    this.miApi.getDatos().subscribe((data: any) => {
      console.log('prubeba, prubea', data);
      this.productos = data.data;
      console.log('Productos desde la API:', this.productos);
    });
  }
    //invertimos
  FormChange() {
    this.SePuedeVerElformulario = !this.SePuedeVerElformulario;
  }

  // Manejar envío del formulario
  GuardarData() {
    console.log("Formulario enviado: ", this.product);
    // Resetear el objeto y ocultar formulario
    this.product = {
      name: '',
      code: '',
      price: null,
      description: '',
      cantidad: null,
    };
    this.SePuedeVerElformulario = false;
  }
}
