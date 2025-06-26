import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComercioHeaderComponent } from '../comercio-header/comercio-header.component';
import { HeaderStatillComponent } from 'src/app/Componentes/header-statill/header-statill.component';

@Component({
  selector: 'app-escanear',
  standalone: true,
  imports: [
    ComercioHeaderComponent, 
    CommonModule, 
    HeaderStatillComponent,
    FormsModule
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