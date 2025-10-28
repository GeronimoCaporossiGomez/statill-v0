import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "src/app/Componentes/sidebar-statill/sidebar.component";
import { MiApiService } from '../../servicios/mi-api.service';

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

  // Datos del formulario de crear producto
  newProduct = {
    name: '',
    brand: '',
    price: null,
    type: '',
    quantity: null,
    description: '',
    barcode: '',
    store_id: 4 // Por defecto
  };

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

  constructor(private apiService: MiApiService) {}

  ngOnInit() {
    // Inicialización del componente
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
      this.stopScanning();
    }
  }

  startScanning() {
    if (!this.isCameraOn) {
      this.errorMessage = 'Primero enciende la cámara';
      return;
    }

    this.isScanning = true;
    this.errorMessage = 'Escaneando... Apunta la cámara hacia el código de barras';
    
    // Simulación de escaneo (aquí iría QuaggaJS en implementación real)
    this.scanInterval = setInterval(() => {
      // Simular detección de código de barras aleatorio
      if (Math.random() > 0.7) { // 30% de probabilidad cada segundo
        const simulatedBarcode = this.generateSimulatedBarcode();
        this.onBarcodeDetected(simulatedBarcode);
      }
    }, 1000);
  }

  stopScanning() {
    this.isScanning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  generateSimulatedBarcode(): string {
    // Generar código de barras simulado
    const barcodes = [
      '7890123456789',
      '1234567890123', 
      '9876543210987',
      '5555666677778',
      '1111222233334'
    ];
    return barcodes[Math.floor(Math.random() * barcodes.length)];
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
          // Productos encontrados
          this.foundProducts = response.data;
          this.displayFoundProducts();
          this.errorMessage = `Se encontraron ${response.data.length} producto(s) con este código`;
        } else {
          // No hay productos, mostrar formulario de crear
          this.showCreateProductForm(barcode);
        }
      },
      error: (error) => {
        console.error('Error buscando productos:', error);
        this.isLoading = false;
        // Si hay error en la búsqueda, asumir que no hay productos
        this.showCreateProductForm(barcode);
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
    this.newProduct.barcode = barcode;
    this.showCreateForm = true;
    this.foundProducts = [];
    this.errorMessage = `No se encontraron productos con código ${barcode}. Crear nuevo producto:`;
  }

  createProduct() {
    if (!this.newProduct.name || !this.newProduct.price) {
      this.errorMessage = 'Complete al menos el nombre y precio del producto';
      return;
    }

    const productData = {
      name: this.newProduct.name,
      brand: this.newProduct.brand || 'Sin marca',
      price: this.newProduct.price,
      type: Number(this.newProduct.type),
      quantity: Number(this.newProduct.quantity) || 1,
      desc: this.newProduct.description || '',
      barcode: this.newProduct.barcode,
      store_id: this.newProduct.store_id
    };

    this.isLoading = true;
    this.apiService.crearProducto(productData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.errorMessage = '¡Producto creado exitosamente!';
        
        // Mostrar el producto recién creado
        this.displayData = {
          nombre: this.newProduct.name,
          marca: this.newProduct.brand || 'Sin marca',
          codigo: this.newProduct.barcode,
          precio: `$${this.newProduct.price}`,
          tipo: this.getTypeNameById(Number(this.newProduct.type)),
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
    this.newProduct = {
      name: '',
      brand: '',
      price: null,
      type: '',
      quantity: null,
      description: '',
      barcode: '',
      store_id: 4
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
  }
}
