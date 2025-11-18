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
    const user = this.authService.getCurrentUser();
    if (user && user.store_id) {
      this.producto.store_id = user.store_id;
      this.cargarProductos();
    } else {
      this.authService.fetchCurrentUser().subscribe({
        next: () => {
          const updatedUser = this.authService.getCurrentUser();
          if (updatedUser && updatedUser.store_id) {
            this.producto.store_id = updatedUser.store_id;
            this.cargarProductos();
          }
        }
      });
    }
  }

  //invertir formulario
  FormChange() {
    this.SePuedeVerElformulario = !this.SePuedeVerElformulario;
  }

  onEdit(producto: any, index: number) {
    this.editarIndex = index;
    this.editarProducto = { ...producto };
    this.SePuedeVerElformulario = true;

    const user = this.authService.getCurrentUser();
    const storeId = user?.store_id || producto.store_id;

    this.producto = {
      name: producto.name,
      brand: producto.brand,
      price: producto.price,
      points_price: producto.points_price,
      type: 1,
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

    const user = this.authService.getCurrentUser();
    if (user && user.store_id) {
      productoData.store_id = user.store_id;
    } else {
      this.errorMessage = 'Error: No se pudo obtener el ID de tu tienda.';
      this.isLoading = false;
      return;
    }

    if (this.productoEditandoId) {
      this.miApi
        .editarProducto(this.productoEditandoId, productoData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.errorMessage = '¡Producto editado exitosamente!';

            if (this.archivoProducto) {
              const res: any = response || {};
              const prodId =
                this.productoEditandoId ?? res?.data?.id ?? res?.id;
              if (prodId) {
                this.miApi
                  .uploadImage('product', prodId, this.archivoProducto)
                  .subscribe({
                    next: () => {
                      this.cargarProductos();
                      this.resetForm();
                      setTimeout(() => (this.errorMessage = null), 3000);
                    },
                    error: () => {
                      this.cargarProductos();
                      this.resetForm();
                      setTimeout(() => (this.errorMessage = null), 3000);
                    },
                  });
              } else {
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
            this.isLoading = false;
            this.errorMessage = `Error al editar producto: ${error.error?.message || error.message}`;
          },
        });
    } else {
      this.miApi.crearProducto(productoData).subscribe({
  next: (res: any) => {
    const prodId = res?.data?.id ?? res?.id;
    
    if (this.archivoProducto && prodId) {
      this.miApi.uploadImage('product', prodId, this.archivoProducto).subscribe({
        next: () => {
          this.isLoading = false;
          this.errorMessage = '¡Producto creado exitosamente!';
          this.cargarProductos();
          this.resetForm();
          setTimeout(() => (this.errorMessage = null), 3000);
        },
        error: (err) => {
          console.error('Error subiendo imagen:', err);
          this.isLoading = false;
          this.errorMessage = 'Producto creado, pero no se pudo subir la imagen';
          this.cargarProductos();
          this.resetForm();
        }
      });
    } else {
      this.isLoading = false;
      this.errorMessage = '¡Producto creado exitosamente!';
      this.cargarProductos();
      this.resetForm();
    }
  },
  error: (error) => {
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
    const user = this.authService.getCurrentUser();

    if (!user || !user.store_id) {
      console.error('❌ No se puede cargar productos: usuario o store_id no disponible');
      this.productos = [];
      return;
    }

    console.log('🔍 Cargando productos para store_id:', user.store_id);

    // CORREGIDO: Usar getProductosById en lugar de getProductos
    this.miApi.getProductosById(user.store_id).subscribe({
      next: (data: any) => {
        let todosLosProductos = data.data || data || [];
        // FILTRO ADICIONAL: Filtrar en el cliente por store_id
        this.productos = todosLosProductos.filter((p: any) => {
          return p.store_id === user.store_id;
        });;

        // Cargar imágenes para cada producto
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
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
        this.productos = [];
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
  }
}
