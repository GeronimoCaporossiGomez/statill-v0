import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';
import { SidebarComponent } from "src/app/Componentes/sidebar-statill/sidebar.component";
import { CrearProductoFormComponent } from 'src/app/Componentes/crear-producto-form/crear-producto-form.component';
import { MiApiService, ProductsResponse } from '../../servicios/mi-api.service';
import { ComercioService } from '../../servicios/comercio.service';

// Declarar QuaggaJS
declare const Quagga: any;

@Component({
  selector: 'app-escanear',
  standalone: true,
  imports: [
    ComercioHeaderComponent,
    CommonModule,
    HeaderStatillComponent,
    SidebarComponent,
    CrearProductoFormComponent
  ],
  templateUrl: './escanear.component.html',
  styleUrls: ['./escanear.component.scss']
})
export class EscanearComponent implements OnDestroy, OnInit {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  private stream: MediaStream | null = null;
  isCameraOn = false;
  errorMessage: string | null = null;
  isScanning = false;
  showCreateForm = false;
  scannedBarcode: string = '';
  foundProducts: any[] = [];
  isLoading = false;
  currentStore: any = null;

  // Datos del formulario
  datosEscaneados = {
    nombre: '',
    tipo: '',
    codigo: '',
    precio: '',
    fecha: new Date().toLocaleDateString()
  };

  // Producto para el formulario
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

  tiposProducto = [
    'Alimento',
    'Bebida',
    'Electrónico',
    'Ropa',
    'Hogar',
    'Otro'
  ];

  constructor(
    private apiService: MiApiService,
    private comercioService: ComercioService
  ) {}

  ngOnInit() {
    this.loadCurrentStore();
  }

  loadCurrentStore() {
    this.comercioService.getStores().subscribe({
      next: (stores) => {
        if (stores && stores.length > 0) {
          this.currentStore = stores[0];
          this.producto.store_id = this.currentStore.id;
          console.log('Tienda actual cargada:', this.currentStore);
        }
      },
      error: (error) => {
        console.error('Error cargando tiendas:', error);
      }
    });
  }

  async toggleCamera() {
    if (this.isCameraOn) {
      this.stopCamera();
    } else {
      await this.startCamera();
    }
  }

  async startCamera() {
    try {
      // Inicializar QuaggaJS con la cámara
      await this.initializeQuagga();
      this.isCameraOn = true;
      this.errorMessage = null;
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.errorMessage = 'No se pudo acceder a la cámara';
    }
  }

  async initializeQuagga() {
    return new Promise((resolve, reject) => {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: this.videoElement.nativeElement,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ]
        },
        locate: true
      }, (err: any) => {
        if (err) {
          console.error('Error initializing Quagga:', err);
          reject(err);
          return;
        }
        console.log("QuaggaJS initialized successfully");
        resolve(true);
      });

      // Configurar el evento de detección
      Quagga.onDetected((result: any) => {
        const code = result.codeResult.code;
        console.log('🔍 Código de barras detectado:', code);
        this.onBarcodeDetected(code);
        this.stopScanning();
      });
    });
  }

  stopCamera() {
    if (this.isCameraOn) {
      Quagga.stop();
      this.isCameraOn = false;
      this.stopScanning();
      console.log("Cámara detenida");
    }
  }

  startScanning() {
    if (!this.isCameraOn) {
      this.errorMessage = 'Primero enciende la cámara';
      return;
    }

    this.isScanning = true;
    this.errorMessage = 'Escaneando... Apunta la cámara hacia el código de barras';
    
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
    
    this.apiService.getProductsByBarcode(barcode).subscribe({
      next: (response: ProductsResponse) => {
        this.isLoading = false;
        
        if (response.successful && response.data && response.data.length > 0) {
          // Filtrar solo productos que tienen el MISMO código de barras que se escaneó
          const productsWithMatchingBarcode = response.data.filter((product: any) => 
            product.barcode && 
            product.barcode !== null && 
            product.barcode !== '' &&
            product.barcode === barcode
          );
          
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
          this.foundProducts = [];
          this.showCreateProductForm(barcode);
          this.errorMessage = `No se encontraron productos con código de barras "${barcode}". Crear nuevo producto:`;
        }
      },
      error: (error) => {
        console.error('Error buscando productos:', error);
        this.isLoading = false;
        this.foundProducts = [];
        this.showCreateProductForm(barcode);
        this.errorMessage = `Error buscando productos. Crear nuevo producto con código "${barcode}":`;
      }
    });
  }

  showCreateProductForm(barcode: string) {
    this.producto.barcode = barcode;
    this.showCreateForm = true;
    this.foundProducts = [];
  }

  showCreateProductFormWithData(barcode: string, foundProducts: any[]) {
    const referenceProduct = foundProducts[0];
    
    this.producto = {
      name: referenceProduct.name || '',
      brand: referenceProduct.brand || '',
      price: 0, // No prellenar precio
      points_price: 1,
      type: referenceProduct.type || 1,
      quantity: 0, // No prellenar cantidad
      desc: referenceProduct.desc || '',
      barcode: barcode,
      hidden: false,
      store_id: this.producto.store_id
    };
    
    this.showCreateForm = true;
  }

  onProductoSubmit(productoData: any) {
    this.isLoading = true;
    this.errorMessage = null;

    this.apiService.crearProducto(productoData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.errorMessage = '¡Producto creado exitosamente!';
        console.log('✅ Producto creado:', response);
        this.resetForm();
        setTimeout(() => this.errorMessage = null, 3000);
      },
      error: (error) => {
        console.error('❌ Error creando producto:', error);
        this.isLoading = false;
        this.errorMessage = `Error al crear el producto: ${error.error?.message || error.message || 'Error desconocido'}`;
      }
    });
  }

  onCancelar() {
    this.resetForm();
  }

  onReset() {
    this.resetForm();
  }

  resetForm() {
    this.showCreateForm = false;
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
      store_id: this.producto.store_id
    };
    this.foundProducts = [];
    this.scannedBarcode = '';
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
    window.print();
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

  ngOnDestroy() {
    this.stopCamera();
    
    // Limpiar QuaggaJS completamente
    if (typeof Quagga !== 'undefined') {
      Quagga.stop();
      Quagga.offDetected();
    }
  }
}