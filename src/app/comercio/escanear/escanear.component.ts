import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "src/app/Componentes/sidebar-statill/sidebar.component";
import { MiApiService } from '../../servicios/mi-api.service';
import { ComercioService } from '../../servicios/comercio.service';

// Importar QuaggaJS
// Declarar QuaggaJS
declare const Quagga: any;

@Component({
  selector: 'app-escanear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent
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
  scanInterval: any;

  // Estados del componente
  showCreateForm = false;
  scannedBarcode: string = '';
  foundProducts: any[] = [];
  isLoading = false;

  // Datos del formulario de crear producto (basado en stock.component)
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

  // Información de la tienda actual
  currentStore: any = null;

  // Datos mostrados (productos encontrados o escaneados)
  displayData = {
    nombre: '',
    marca: '',
    codigo: '',
    precio: '',
    tipo: '',
    fecha: new Date().toLocaleDateString()
  };

  tiposProducto = [
    { id: 0, name: 'Restaurante' },
    { id: 1, name: 'Kiosco' },
    { id: 2, name: 'Supermercado' },
    { id: 3, name: 'Panadería' }
  ];

  constructor(
    private apiService: MiApiService,
    private comercioService: ComercioService
  ) {}

  ngOnInit() {
    // Obtener la tienda actual (por ahora usamos la primera tienda disponible)
    this.loadCurrentStore();
  }

  loadCurrentStore() {
    this.comercioService.getStores().subscribe({
      next: (stores) => {
        if (stores && stores.length > 0) {
          // Por ahora usamos la primera tienda disponible
          // En una implementación real, esto vendría de la autenticación o selección del usuario
          this.currentStore = stores[0];
          this.product.shop = this.currentStore.id.toString();
          console.log('Tienda actual cargada:', this.currentStore);
        }
      },
      error: (error) => {
        console.error('Error cargando tiendas:', error);
        // Mantener el store_id por defecto si hay error
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
            facingMode: "environment" // Usar cámara trasera
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
        this.stopScanning(); // Detener el escaneo después de detectar
      });
    });
  }

  stopCamera() {
    if (this.isCameraOn) {
      // Detener QuaggaJS
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
    
    this.apiService.getProductsByBarcode(barcode).subscribe({
      next: (response) => {
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

    const productoApi = {
      name: this.product.name,
      brand: this.product.brand || 'algo',
      price: this.product.price,
      type: 1, // Tipo por defecto
      quantity: Number(this.product.cantidad) || 1,
      desc: this.product.description || '',
      barcode: this.scannedBarcode,
      store_id: Number(this.product.shop) || 4
    };

    this.isLoading = true;
    this.apiService.crearProducto(productoApi).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.errorMessage = '¡Producto creado exitosamente!';
        
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
        console.error('Error creando producto:', error);
        this.isLoading = false;
        this.errorMessage = 'Error al crear el producto. Inténtelo de nuevo.';
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

  ngOnDestroy() {
    this.stopCamera();
    this.stopScanning();
    
    // Limpiar QuaggaJS completamente
    if (typeof Quagga !== 'undefined') {
      Quagga.stop();
      Quagga.offDetected();
    }
  }
}
