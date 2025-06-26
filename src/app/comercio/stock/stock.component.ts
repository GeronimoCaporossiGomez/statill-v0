import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Cambiado a forms modulee

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule], // Usar FormsModule para el ngmodel
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent {
  SePuedeVerElformulario = false; // arranca escondidiwis
  product = { // Objeto para almacenar datos del formulario
    name: '',
    code: '',
    price: null,
    description: '',
    cantidad: null,
  };

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