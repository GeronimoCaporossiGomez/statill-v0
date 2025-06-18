import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrowserMultiFormatReader } from '@zxing/browser';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockPageComponent implements OnInit, OnDestroy {
  mostrarScanner = false;
  productoForm: FormGroup;
  productos = signal<any[]>([]);
  alertaStockBajo = signal(false);
  private codeReader = new BrowserMultiFormatReader();
  private videoElement?: HTMLVideoElement;
  imagenBase64: string | null = null;

  constructor(private fb: FormBuilder) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      codigoBarras: ['', Validators.required],
      imagen: ['']
    });
  }

  ngOnInit(): void {}

  abrirScanner(): void {
    this.mostrarScanner = true;
    setTimeout(() => {
      this.videoElement = document.querySelector('video');
      if (this.videoElement) {
        this.codeReader.decodeFromVideoDevice(null, this.videoElement, (result, error) => {
          if (result) {
            const codigo = result.getText();
            this.productoForm.patchValue({ codigoBarras: codigo });
            this.mostrarScanner = false;
            this.codeReader.stopContinuousDecode();
          }
        });
      }
    }, 300);
  }

  cerrarScanner(): void {
    this.mostrarScanner = false;
    this.codeReader.stopContinuousDecode();
  }

  manejarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenBase64 = reader.result as string;
        this.productoForm.patchValue({ imagen: this.imagenBase64 });
      };
      reader.readAsDataURL(file);
    }
  }

  agregarProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    const nuevo = this.productoForm.value;
    this.productos.update(prev => [...prev, nuevo]);

    this.alertaStockBajo.set(nuevo.stock < 5);

    this.productoForm.reset({
      nombre: '',
      descripcion: '',
      precio: null,
      stock: null,
      codigoBarras: '',
      imagen: ''
    });
    this.imagenBase64 = null;
  }

  eliminarProducto(index: number): void {
    this.productos.update(list => list.filter((_, i) => i !== index));
  }

  totalProductos = computed(() => this.productos().length);

  ngOnDestroy(): void {
    this.codeReader.stopContinuousDecode();
  }

  mostrarError(campo: string): boolean {
    const control = this.productoForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }
}
