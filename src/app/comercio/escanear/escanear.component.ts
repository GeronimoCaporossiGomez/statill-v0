import {
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';
import {
  ProductoFormComponent,
  ProductoData,
} from 'src/app/Componentes/producto-form/producto-form.component';
import { MiApiService, ProductsResponse } from '../../servicios/mi-api.service';
import { ComercioService } from '../../servicios/comercio.service';
import { Output, EventEmitter } from '@angular/core';

// Declarar QuaggaJS
declare const Quagga: any;

@Component({
  selector: 'app-escanear',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ProductoFormComponent],
  templateUrl: './escanear.component.html',
  styleUrls: ['./escanear.component.scss'],
})
export class EscanearComponent implements OnDestroy, OnInit {
  @Output() barcodeDetected = new EventEmitter<string>();
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  private stream: MediaStream | null = null;
  private quaggaInitialized = false; // 🔥 Nueva bandera
  isCameraOn = false;
  errorMessage: string | null = null;
  isScanning = false;
  showCreateForm = false;
  scannedBarcode: string = '';
  foundProducts: any[] = [];
  isLoading = false;
  currentStore: any = null;
  manualBarcode: string = '';
  private lastDetectedAt = 0;
  private readonly detectionCooldownMs = 2500;

  // Producto para el formulario
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

  constructor(
    private apiService: MiApiService,
    private comercioService: ComercioService,
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
      },
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
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: this.videoElement.nativeElement,
            constraints: {
              width: 640,
              height: 480,
              facingMode: 'environment',
            },
          },
          locator: {
            patchSize: 'medium',
            halfSample: true,
          },
          numOfWorkers: 2,
          frequency: 10,
          decoder: {
            readers: [
              'code_128_reader',
              'ean_reader',
              'ean_8_reader',
              'code_39_reader',
              'code_39_vin_reader',
              'codabar_reader',
              'upc_reader',
              'upc_e_reader',
              'i2of5_reader',
            ],
          },
          locate: true,
        },
        (err: any) => {
          if (err) {
            console.error('Error initializing Quagga:', err);
            reject(err);
            return;
          }
          console.log('QuaggaJS initialized successfully');
          this.quaggaInitialized = true; // 🔥 Marcar como inicializado
          resolve(true);
        },
      );

      Quagga.onDetected((result: any) => {
        const code = result.codeResult?.code;
        const now = Date.now();
        if (!code) {
          return;
        }

        if (now - this.lastDetectedAt < this.detectionCooldownMs) {
          return;
        }
        this.lastDetectedAt = now;

        console.log('🔍 Código de barras detectado:', code);
        this.onBarcodeDetected(code);
      });
    });
  }

  stopCamera() {
    if (this.isCameraOn) {
      try {
        Quagga.stop();
        console.log('Cámara detenida');
      } catch (error) {
        console.error('Error al detener Quagga:', error);
      }
      this.isCameraOn = false;
      this.stopScanning();
    }
  }

  startScanning() {
    if (!this.isCameraOn) {
      this.errorMessage = 'Primero enciende la cámara';
      return;
    }

    this.isScanning = true;
    this.errorMessage =
      'Escaneando... Apunta la cámara hacia el código de barras';

    Quagga.start();
    console.log('Escaneo iniciado - QuaggaJS activo');
  }

  stopScanning() {
    this.isScanning = false;
    try {
      if (typeof Quagga !== 'undefined' && Quagga.pause) {
        Quagga.pause();
      }
    } catch (error) {
      console.error('Error al pausar Quagga:', error);
    }
    console.log('Escaneo detenido');
  }

  onBarcodeDetected(barcode: string) {
    this.scannedBarcode = barcode;
  
    // Emit barcode to parent component 🔥
    this.barcodeDetected.emit(barcode);
  
    // (Optional) Still run your internal logic
    this.searchProductsByBarcode(barcode);
  }

  searchProductsByBarcode(barcode: string) {
    this.isLoading = true;
    this.errorMessage = `Buscando productos con código: ${barcode}`;

    this.apiService.getProductsByBarcode(barcode).subscribe({
      next: (response: ProductsResponse) => {
        this.isLoading = false;

        if (response.successful && response.data && response.data.length > 0) {
          const productsWithMatchingBarcode = response.data.filter(
            (product: any) =>
              product.barcode &&
              product.barcode !== null &&
              product.barcode !== '' &&
              product.barcode === barcode,
          );

          console.log('Código escaneado:', barcode);
          console.log('Total productos en respuesta:', response.data.length);
          console.log(
            'Productos con código de barras coincidente:',
            productsWithMatchingBarcode.length,
          );

          if (productsWithMatchingBarcode.length > 0) {
            this.foundProducts = productsWithMatchingBarcode;
            this.showCreateProductFormWithSuggestedData(
              barcode,
              productsWithMatchingBarcode,
            );
            this.errorMessage = `Se encontraron ${productsWithMatchingBarcode.length} producto(s) con código de barras "${barcode}".`;
          } else {
            this.foundProducts = [];
            this.showCreateProductForm(barcode);
            this.errorMessage = `No se encontraron productos con código de barras "${barcode}". Crear nuevo producto:`;
          }
        } else {
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
      },
    });
  }

  showCreateProductForm(barcode: string) {
    this.producto.barcode = barcode;
    this.showCreateForm = true;
    this.foundProducts = [];
  }

  showCreateProductFormWithSuggestedData(
    barcode: string,
    foundProducts: any[],
  ) {
    this.producto = {
      name: '',
      brand: '',
      price: 0,
      points_price: 1,
      type: 1,
      quantity: 0,
      desc: '',
      barcode: barcode,
      hidden: false,
      store_id: this.producto.store_id,
    };

    this.showCreateForm = true;
  }

  onProductoSubmit(productoData: ProductoData) {
    this.isLoading = true;
    this.errorMessage = null;

    this.apiService.crearProducto(productoData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.errorMessage = '¡Producto creado exitosamente!';
        console.log('Producto creado:', response);
        this.resetForm();
        setTimeout(() => (this.errorMessage = null), 3000);
      },
      error: (error) => {
        console.error('Error creando producto:', error);
        this.isLoading = false;
        this.errorMessage = `Error al crear el producto: ${error.error?.message || error.message || 'Error desconocido'}`;
      },
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
      store_id: this.producto.store_id,
    };
    this.foundProducts = [];
    this.scannedBarcode = '';
  }

  onUseSuggestedData(useSuggested: boolean) {
    console.log('Usar datos sugeridos:', useSuggested);
  }

  onManualSubmit() {
    const code = (this.manualBarcode || '').trim();
    if (!code) {
      return;
    }
    this.scannedBarcode = code;
    this.searchProductsByBarcode(code);
  }

  // 🔥🔥🔥 MÉTODO MEJORADO PARA LIMPIAR RECURSOS
  ngOnDestroy() {
    console.log('🧹 Limpiando recursos de EscanearComponent...');

    // 1. Detener la cámara primero
    this.stopCamera();

    // 2. Limpiar QuaggaJS completamente
    if (typeof Quagga !== 'undefined' && this.quaggaInitialized) {
      try {
        // Remover todos los event listeners
        Quagga.offDetected();
        Quagga.offProcessed();

        // Detener completamente
        Quagga.stop();

        console.log('✅ QuaggaJS limpiado correctamente');
      } catch (error) {
        console.error('Error al limpiar Quagga:', error);
      }
    }

    // 3. Limpiar el stream de MediaStream si existe
    if (this.stream) {
      try {
        this.stream.getTracks().forEach((track) => {
          track.stop();
          console.log('Track detenido:', track.kind);
        });
        this.stream = null;
      } catch (error) {
        console.error('Error al detener stream:', error);
      }
    }

    // 4. Resetear banderas
    this.quaggaInitialized = false;
    this.isCameraOn = false;
    this.isScanning = false;

    console.log('✅ Recursos limpiados completamente');
  }
}
