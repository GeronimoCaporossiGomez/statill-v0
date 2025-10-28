import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';
import { CrearProductoFormComponent } from 'src/app/Componentes/crear-producto-form/crear-producto-form.component';
import { MiApiService } from 'src/app/servicios/mi-api.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, SidebarComponent, CrearProductoFormComponent],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent {
  constructor(private miApi: MiApiService) {}

  SePuedeVerElformulario = false;
  producto = {
    name: '',
    brand: '',
    price: 0,
    points_price: 1,
    type: 1,
    quantity: 0,
    desc: '',
    barcode: '',
    hidden: false,
    store_id: 1
  };

  productos: any[] = [];
  editarIndex: number | null = null;
  editarProducto: any = {};
  productoEditandoId: number | null = null;
  isLoading = false;
  errorMessage: string | null = null;

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
    this.producto = {
      name: producto.name,
      brand: producto.brand,
      price: producto.price,
      points_price: producto.points_price,
      type: producto.type,
      quantity: producto.quantity,
      desc: producto.desc,
      barcode: producto.barcode,
      hidden: producto.hidden,
      store_id: producto.store_id
    };
    this.productoEditandoId = producto.id;
  }

  onProductoSubmit(productoData: any) {
    this.isLoading = true;
    this.errorMessage = null;

    if (this.productoEditandoId) {
      // Editar producto existente (PUT)
      this.miApi.editarProducto(this.productoEditandoId, productoData).subscribe({
        next: (response) => {
          console.log('✅ Producto editado correctamente:', response);
          this.isLoading = false;
          this.errorMessage = '¡Producto editado exitosamente!';
          this.cargarProductos();
          this.resetForm();
          setTimeout(() => this.errorMessage = null, 3000);
        },
        error: (error) => {
          console.error('❌ Error al editar producto:', error);
          this.isLoading = false;
          this.errorMessage = `Error al editar producto: ${error.error?.message || error.message}`;
        }
      });
    } else {
      // Crear producto nuevo (POST)
      this.miApi.crearProducto(productoData).subscribe({
        next: (response) => {
          console.log('✅ Producto creado correctamente:', response);
          this.isLoading = false;
          this.errorMessage = '¡Producto creado exitosamente!';
          this.cargarProductos();
          this.resetForm();
          setTimeout(() => this.errorMessage = null, 3000);
        },
        error: (error) => {
          console.error('❌ Error al crear producto:', error);
          this.isLoading = false;
          this.errorMessage = `Error al crear producto: ${error.error?.message || error.message}`;
        }
      });
    }
  }

  onCancelar() {
    this.resetForm();
  }

  onReset() {
    this.resetForm();
  }

  cargarProductos() {
    this.miApi.getProductos().subscribe((data: any) => {
      this.productos = data.data;
    });
  }

  resetForm() {
    this.producto = {
      name: '',
      brand: '',
      price: 0,
      points_price: 1,
      type: 1,
      quantity: 0,
      desc: '',
      barcode: '',
      hidden: false,
      store_id: 1
    };
    this.SePuedeVerElformulario = false;
    this.editarIndex = null;
    this.productoEditandoId = null;
    this.errorMessage = null;
  }
  // Manejar envío del formulario
}
