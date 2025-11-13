import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';
import {
  ProductoFormComponent,
  ProductoData,
} from 'src/app/Componentes/producto-form/producto-form.component';
import { MiApiService } from 'src/app/servicios/mi-api.service';
import { AuthService } from 'src/app/servicios/auth.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ProductoFormComponent],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent implements OnInit {
  constructor(
    private miApi: MiApiService,
    private authService: AuthService,
  ) {}

  SePuedeVerElformulario = false;
  producto: ProductoData = {
    name: '',
    brand: '',
    price: 0,
    points_price: 1,
    type: 1,
    quantity: 0,
    desc: '',
    barcode: '',
    hidden: false,
    store_id: 1,
  };

  productos: any[] = [];
  editarIndex: number | null = null;
  editarProducto: any = {};
  productoEditandoId: number | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  archivoProducto: File | null = null;

  get totalProductos(): number {
    return this.productos.length;
  }

  get totalUnidades(): number {
    return this.productos.reduce(
      (acc, producto) => acc + (producto?.quantity ?? 0),
      0,
    );
  }

  ngOnInit() {
    // Establecer el store_id del usuario owner
    const user = this.authService.getCurrentUser();
    if (user && user.store_id) {
      this.producto.store_id = user.store_id;
    } else {
      // Si no hay usuario, intentar obtenerlo
      this.authService.fetchCurrentUser().subscribe({
        next: () => {
          const updatedUser = this.authService.getCurrentUser();
          if (updatedUser && updatedUser.store_id) {
            this.producto.store_id = updatedUser.store_id;
          }
        },
      });
    }

    this.miApi.getProductos().subscribe((data: any) => {
      console.log('prubeba, prubea', data);
      this.productos = data.data||[];
      console.log('Productos desde la API:', this.productos);
      for (const p of this.productos) {
        if (p && p.id) {
          this.miApi.getImageByObjectId('product', Number(p.id)).subscribe({
            next: (imgRes: any) => {
              p.img = imgRes?.data || '';
            },
            error: (err) => {
              // No image found or error - leave img empty string so UI shows placeholder
              p.img = '';
            },
          });
        } else {
          p.img = '';
        }
      }
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

    // Mantener el store_id del usuario owner
    const user = this.authService.getCurrentUser();
    const storeId = user?.store_id || producto.store_id;

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
      store_id: storeId,
    };
    this.productoEditandoId = producto.id;
  }

  onProductoSubmit(productoData: ProductoData) {
    this.isLoading = true;
    this.errorMessage = null;

    // Asegurar que el store_id sea el del usuario owner
    const user = this.authService.getCurrentUser();
    if (user && user.store_id) {
      productoData.store_id = user.store_id;
    } else {
      this.errorMessage = 'Error: No se pudo obtener el ID de tu tienda.';
      this.isLoading = false;
      return;
    }

    if (this.productoEditandoId) {
      // Editar producto existente (PUT)
      this.miApi
        .editarProducto(this.productoEditandoId, productoData)
        .subscribe({
          next: (response) => {
            console.log('✅ Producto editado correctamente:', response);
            this.isLoading = false;
            this.errorMessage = '¡Producto editado exitosamente!';
          // Si hay una imagen seleccionada, subirla ahora. Use fallback id when response doesn't include data
          if (this.archivoProducto) {
            const res: any = response || {};
            const prodId = this.productoEditandoId ?? res?.data?.id ?? res?.id;
            if (prodId) {
              this.miApi.uploadImage('product', prodId, this.archivoProducto).subscribe({
                next: () => {
                  console.log('✅ Imagen de producto subida correctamente');
                  this.cargarProductos();
                  this.resetForm();
                  setTimeout(() => (this.errorMessage = null), 3000);
                },
                error: (err) => {
                  console.error('❌ Error al subir imagen de producto:', err);
                  this.cargarProductos();
                  this.resetForm();
                  setTimeout(() => (this.errorMessage = null), 3000);
                },
              });
            } else {
              console.warn('No se encontró ID de producto para subir la imagen (editar).');
              this.cargarProductos();
              this.resetForm();
              setTimeout(() => (this.errorMessage = null), 3000);
            }
          } else {
            this.cargarProductos();
            this.resetForm();
            setTimeout(() => (this.errorMessage = null), 3000);
          }
   
          },
          error: (error) => {
            console.error('❌ Error al editar producto:', error);
            this.isLoading = false;
            this.errorMessage = `Error al editar producto: ${error.error?.message || error.message}`;
          },
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
          setTimeout(() => (this.errorMessage = null), 3000);
        },
        error: (error) => {
          console.error('❌ Error al crear producto:', error);
          this.isLoading = false;
          this.errorMessage = `Error al crear producto: ${error.error?.message || error.message}`;
        },
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
      this.productos = data.data||[];
      this.productos = data.data || [];

      for (const p of this.productos) {
        if (p && p.id) {
          this.miApi.getImageByObjectId('product', Number(p.id)).subscribe({
            next: (imgRes: any) => {
              p.img = imgRes?.data || '';
            },
            error: () => {
              p.img = '';
            },
          });
        } else {
          p.img = '';
        }
      }
    });
  }

  resetForm() {
    const user = this.authService.getCurrentUser();
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
      store_id: user?.store_id || 1,
    };
    this.SePuedeVerElformulario = false;
    this.editarIndex = null;
    this.productoEditandoId = null;
    this.errorMessage = null;
    this.archivoProducto = null;
  }
  onFileSelected(file: File | null) {
    this.archivoProducto = file;
  }
  onUseSuggestedData(useSuggested: boolean) {
    console.log('Usar datos sugeridos:', useSuggested);
    // No hay datos sugeridos en el componente de stock
  }
  // Manejar envío del formulario
}
