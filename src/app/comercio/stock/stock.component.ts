import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent {
  SePuedeVerElformulario = false
  FormChange() {
this.SePuedeVerElformulario = !this.SePuedeVerElformulario
  }
  GuardarData(FormData: any) {
    console.log("Formulario enviado: ", FormData);
    this.SePuedeVerElformulario = false
  }
}
