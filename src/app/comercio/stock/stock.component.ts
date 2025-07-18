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
  editarIndex: number | null = null;
  editarProducto: any = {};
  productoEditandoId: number | null = null; // Nuevo: ID del producto que se está editando

  ngOnInit() {
    this.miApi.getProductos().subscribe((data: any) => {
      console.log('prubeba, prubea', data);
      this.productos = data.data;
      console.log('Productos desde la API:', this.productos);
    });
  }
    //invertimos
  FormChange() {
    this.SePuedeVerElformulario = !this.SePuedeVerElformulario;
  }

  onEdit(producto: any, index: number) {
    this.editarIndex = index;
    this.editarProducto = { ...producto };
    this.SePuedeVerElformulario = true;
    this.product = {
      name: producto.name,
      brand: producto.brand,
      price: producto.price,
      type: producto.type,
      cantidad: producto.quantity,
      description: producto.desc,
      code: producto.barcode,
      shop: producto.store_id
    };
    this.productoEditandoId = producto.id; // Guardar el id real del producto
  }

  GuardarData() {
    const productoApi = { //voy a meter un datos duros para que me deje hacerlo
      name: this.product.name,
      brand: 'algo',
      price: this.product.price,
      type: 0,
      quantity: Number(this.product.cantidad),
      desc: this.product.description,
      barcode: '+',
      store_id: 2
    };
    if (this.productoEditandoId) {
      // Editar producto existente (PUT)
      this.miApi.editarProducto(this.productoEditandoId, productoApi).subscribe(
        response => {
          console.log('Producto editado correctamente:', response);
          this.miApi.getProductos().subscribe((data: any) => {
            this.productos = data.data;
          });
        },
        error => {
          console.error('Error al editar producto:', error);
        }
      );
      this.productoEditandoId = null;
      this.editarIndex = null;
    } else {
      // Crear producto nuevo (POST)
      this.miApi.crearProducto(productoApi).subscribe(
        response => {
          console.log('Producto posteado correctamente:', response);
          this.miApi.getProductos().subscribe((data: any) => {
            this.productos = data.data;
          });
        },
        error => {
          console.error('Error al crear producto:', error);
        }
      );
    }
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
