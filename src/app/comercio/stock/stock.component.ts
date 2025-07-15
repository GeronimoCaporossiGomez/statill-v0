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
  product = {
    name: '',
    brand: '',
    price: null,
    type: '',
    cantidad: null,
    description: '',
    code: '',
    shop: ''
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

  GuardarData() {
    const productoApi = {
      name: this.product.name,
      brand: this.product.brand,
      price: this.product.price,
      type: this.product.type,
      quantity: Number(this.product.cantidad),
      desc: this.product.description,
      barcode: this.product.code,
      store_id: 2
    };
    console.log("Formulario enviado: ", productoApi);
    this.miApi.crearProducto(productoApi).subscribe(
      response => {
        console.log('Producto creado:', response);
        // Actualizar la lista de productos después de crear
        this.miApi.getDatos().subscribe((data: any) => {
          this.productos = data.data;
          console.log('Productos actualizados:', this.productos);
        });
      },
      error => {
        console.error('Error al crear producto:', error);
      }
    );
    // Resetear el objeto y ocultar formulario
    this.product = {
      name: '',
      brand: '',
      price: null,
      type: '',
      cantidad: null,
      description: '',
      code: '',
      shop: ''
    };
    this.SePuedeVerElformulario = false;
  }
  // Manejar envío del formulario
}
