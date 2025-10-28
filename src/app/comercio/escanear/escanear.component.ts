import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';
import { SidebarComponent } from "src/app/Componentes/sidebar-statill/sidebar.component";

@Component({
  selector: 'app-escanear',
  standalone: true,
  imports: [
    ComercioHeaderComponent,
    CommonModule,
    HeaderStatillComponent,
    FormsModule,
    SidebarComponent
],
  templateUrl: './escanear.component.html',
  styleUrls: ['./escanear.component.scss']
})
export class EscanearComponent implements OnDestroy {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  private stream: MediaStream | null = null;
  isCameraOn = false;
  errorMessage: string | null = null;

  // Datos del formulario
  datosEscaneados = {
    nombre: '',
    tipo: '',
    codigo: '',
    precio: '',
    fecha: new Date().toLocaleDateString()
  };

  tiposProducto = [
    'Alimento',
    'Bebida',
    'Electrónico',
    'Ropa',
    'Hogar',
    'Otro'
  ];

  async toggleCamera() {
    if (this.isCameraOn) {
      this.stopCamera();
    } else {
      await this.startCamera();
    }
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 600 },
          height: { ideal: 500 },
          facingMode: 'environment'
        },
        audio: false
      });

      this.videoElement.nativeElement.srcObject = this.stream;
      this.isCameraOn = true;
      this.errorMessage = null;
    } catch (err) {
      console.error('Error accessing camera:', err);
      this.errorMessage = 'No se pudo acceder a la cámara.';
      this.isCameraOn = false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.videoElement.nativeElement.srcObject = null;
      this.stream = null;
      this.isCameraOn = false;
    }
  }

<<<<<<< Updated upstream
=======
  startScanning() {
    if (!this.isCameraOn) {
      this.errorMessage = 'Primero enciende la cámara';
      return;
    }

    this.isScanning = true;
    this.errorMessage = 'Escaneando... Apunta la cámara hacia el código de barras';
    
    // Iniciar QuaggaJS para escaneo real
    Quagga.start();
    console.log("Escaneo iniciado - QuaggaJS activo");
  }

  stopScanning() {
    this.isScanning = false;
    if (this.isCameraOn) {
      Quagga.stop();
      console.log("Escaneo detenido");
    }
  }


  onBarcodeDetected(barcode: string) {
    this.stopScanning();
    this.scannedBarcode = barcode;
    this.searchProductsByBarcode(barcode);
  }

  searchProductsByBarcode(barcode: string) {
    this.isLoading = true;
    this.errorMessage = `Buscando productos con código: ${barcode}`;
    
    console.log('🔍 Iniciando búsqueda para código:', barcode);
    console.log('🌐 URL de búsqueda:', `https://statill-api.onrender.com/api/v1/products/?barcode=${barcode}`);
    
    this.apiService.getProductsByBarcode(barcode).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('📡 Respuesta completa de la API:', response);
        
        if (response.successful && response.data && response.data.length > 0) {
          console.log('📊 Todos los productos en la respuesta:', response.data);
          
          // Mostrar todos los códigos de barras para debuggear
          const allBarcodes = response.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            barcode: p.barcode,
            barcodeType: typeof p.barcode,
            barcodeLength: p.barcode ? p.barcode.length : 0
          }));
          console.log('🏷️ Códigos de barras de todos los productos:', allBarcodes);
          
          // Filtrar solo productos que tienen el MISMO código de barras que se escaneó
          const productsWithMatchingBarcode = response.data.filter((product: any) => {
            const matches = product.barcode && 
              product.barcode !== null && 
              product.barcode !== '' &&
              product.barcode === barcode;
            
            if (matches) {
              console.log('✅ Producto coincidente encontrado:', product);
            }
            
            return matches;
          });
          
          console.log('🔍 Código escaneado:', barcode);
          console.log('📊 Total productos en respuesta:', response.data.length);
          console.log('✅ Productos con código de barras coincidente:', productsWithMatchingBarcode.length);
          console.log('🔍 Productos encontrados:', productsWithMatchingBarcode);
          
          if (productsWithMatchingBarcode.length > 0) {
            // Productos encontrados - mostrar formulario de crear con datos prellenados
            this.foundProducts = productsWithMatchingBarcode;
            this.showCreateProductFormWithData(barcode, productsWithMatchingBarcode);
            this.errorMessage = `Se encontraron ${productsWithMatchingBarcode.length} producto(s) con código de barras "${barcode}". Datos prellenados para crear nuevo producto.`;
          } else {
            // No hay productos con el mismo código de barras
            this.foundProducts = [];
            this.showCreateProductForm(barcode);
            this.errorMessage = `No se encontraron productos con código de barras "${barcode}". Crear nuevo producto:`;
          }
        } else {
          // No hay productos, mostrar formulario de crear vacío
          console.log('❌ No hay productos en la respuesta o la respuesta no es exitosa');
          this.foundProducts = [];
          this.showCreateProductForm(barcode);
          this.errorMessage = `No se encontraron productos con código de barras "${barcode}". Crear nuevo producto:`;
        }
      },
      error: (error) => {
        console.error('❌ Error buscando productos:', error);
        console.error('📋 Detalles del error:', error.error);
        console.error('📊 Status:', error.status);
        this.isLoading = false;
        // Si hay error en la búsqueda, asumir que no hay productos
        this.foundProducts = [];
        this.showCreateProductForm(barcode);
        this.errorMessage = `Error buscando productos. Crear nuevo producto con código "${barcode}":`;
      }
    });
  }

  displayFoundProducts() {
    const product = this.foundProducts[0]; // Mostrar el primer producto encontrado
    this.displayData = {
      nombre: product.name || 'Sin nombre',
      marca: product.brand || 'Sin marca',
      codigo: this.scannedBarcode,
      precio: product.price ? `$${product.price}` : 'Sin precio',
      tipo: this.getTypeNameById(product.type),
      fecha: new Date().toLocaleDateString()
    };
    this.showCreateForm = false;
  }

  showCreateProductForm(barcode: string) {
    this.product.code = barcode;
    this.showCreateForm = true;
    this.foundProducts = [];
    this.errorMessage = `No se encontraron productos con código ${barcode}. Crear nuevo producto:`;
  }

  showCreateProductFormWithData(barcode: string, foundProducts: any[]) {
    // Usar el primer producto encontrado para prellenar los datos
    const referenceProduct = foundProducts[0];
    
    this.product = {
      name: referenceProduct.name || '',
      brand: referenceProduct.brand || '',
      price: null, // No prellenar precio para que el usuario lo ingrese
      type: referenceProduct.type?.toString() || '',
      cantidad: null, // No prellenar cantidad
      description: referenceProduct.desc || '',
      code: barcode,
      shop: this.product.shop // Mantener el shop actual
    };
    
    this.showCreateForm = true;
    this.errorMessage = `Productos similares encontrados. Datos prellenados con información de "${referenceProduct.name}" (${referenceProduct.brand}). Complete los campos faltantes:`;
  }

  GuardarData() {
    if (!this.product.name || !this.product.price) {
      this.errorMessage = 'Complete al menos el nombre y precio del producto';
      return;
    }

    // Validar que tenemos un store_id válido
    const storeId = Number(this.product.shop) || 4;
    if (!storeId || storeId <= 0) {
      this.errorMessage = 'Error: No se pudo determinar la tienda. Intente recargar la página.';
      return;
    }

    const productoApi = {
      name: this.product.name,
      brand: this.product.brand || 'algo',
      price: Number(this.product.price),
      type: Number(this.product.type) || 1, // Convertir a número
      quantity: Number(this.product.cantidad) || 1,
      desc: this.product.description || '',
      barcode: this.scannedBarcode,
      store_id: storeId
    };

    console.log('📦 Datos del producto a crear:', productoApi);
    console.log('🏪 Store ID:', storeId);
    console.log('🔍 Código de barras:', this.scannedBarcode);

    this.isLoading = true;
    this.apiService.crearProducto(productoApi).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.errorMessage = '¡Producto creado exitosamente!';
        console.log('✅ Producto creado:', response);
        
        // Mostrar el producto recién creado
        this.displayData = {
          nombre: this.product.name,
          marca: this.product.brand || 'Sin marca',
          codigo: this.scannedBarcode,
          precio: `$${this.product.price}`,
          tipo: 'Producto',
          fecha: new Date().toLocaleDateString()
        };
        
        this.resetForm();
        setTimeout(() => this.errorMessage = null, 3000);
      },
      error: (error) => {
        console.error('❌ Error creando producto:', error);
        console.error('📋 Detalles del error:', error.error);
        console.error('📊 Status:', error.status);
        this.isLoading = false;
        this.errorMessage = `Error al crear el producto: ${error.error?.message || error.message || 'Error desconocido'}`;
      }
    });
  }

  getTypeNameById(typeId: number): string {
    const tipo = this.tiposProducto.find(t => t.id === typeId);
    return tipo ? tipo.name : 'Sin categoría';
  }

  resetForm() {
    this.showCreateForm = false;
    this.product = {
      name: '',
      brand: '',
      price: null,
      type: '',
      cantidad: null,
      description: '',
      code: '',
      shop: this.product.shop // Mantener el shop actual
    };
  }

  limpiarTodo() {
    this.displayData = {
      nombre: '',
      marca: '',
      codigo: '',
      precio: '',
      tipo: '',
      fecha: new Date().toLocaleDateString()
    };
    this.foundProducts = [];
    this.scannedBarcode = '';
    this.resetForm();
    this.errorMessage = null;
  }

>>>>>>> Stashed changes
  ngOnDestroy() {
    this.stopCamera();
  }

  simularEscaneo() {
    // Datos de ejemplo para simular el escaneo
    this.datosEscaneados = {
      nombre: 'Producto Ejemplo ' + Math.floor(Math.random() * 100),
      tipo: this.tiposProducto[Math.floor(Math.random() * this.tiposProducto.length)],
      codigo: 'COD-' + Math.floor(Math.random() * 10000),
      precio: (Math.random() * 100).toFixed(2),
      fecha: new Date().toLocaleDateString()
    };

    this.errorMessage = 'Datos de ejemplo - Simulación de escaneo';
    setTimeout(() => this.errorMessage = null, 3000);
  }

  imprimirDatos() {
    window.print(); // Esto abrirá el diálogo de impresión del navegador
  }

  limpiarFormulario() {
    this.datosEscaneados = {
      nombre: '',
      tipo: '',
      codigo: '',
      precio: '',
      fecha: new Date().toLocaleDateString()
    };
  }
}
