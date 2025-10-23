import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';
import { MiApiService } from 'src/app/servicios/mi-api.service';

@Component({
  selector: 'app-crear-comercio',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterLink],
  templateUrl: './crear-comercio.component.html',
  styleUrl: './crear-comercio.component.scss'
})
export class CrearComercioComponent {
  creando: boolean = true;
  seccionPantalla: number = 0;
  dias: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  imagenUrl: string | ArrayBuffer | null = null;
  archivoLogo: File | null = null;
  userId: number = 1; // Cambiar por el ID real del usuario logueado

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private miApiService: MiApiService
    // private authService: AuthService // Descomenta cuando tengas el servicio de autenticación
  ) {
    // Obtener el user_id del usuario logueado
    // this.userId = this.authService.getUserId();
  }

  aumentarPantalla() {
    this.seccionPantalla += 1;
    if(this.seccionPantalla > 3) {
      this.seccionPantalla = 3;
    }
    this.cdr.markForCheck();
  }

  bajarPantalla() {
    this.seccionPantalla -= 1;
    if (this.seccionPantalla < 1) {
      this.seccionPantalla = 1;
    }
    this.cdr.markForCheck();
  }

  creandoComercio(x: boolean) {
    this.creando = x;
    this.cdr.markForCheck();
  }

  onSubmit(form: NgForm) {
    console.log('📋 Datos del formulario (raw):', form.value);
    
    // Transformar horarios al formato del backend
    const openingTimes: (string | null)[] = [];
    const closingTimes: (string | null)[] = [];
    
    this.dias.forEach((dia, i) => {
      const abierto = form.value[`si${i}`];
      const horaInicio = form.value[`horaInicio${i}`];
      const horaFin = form.value[`horaFin${i}`];
      
      if (abierto && horaInicio) {
        openingTimes.push(this.convertirHoraAISO(horaInicio));
      } else {
        openingTimes.push(null);
      }
      
      if (abierto && horaFin) {
        closingTimes.push(this.convertirHoraAISO(horaFin));
      } else {
        closingTimes.push(null);
      }
    });
    
    // Mapear categoría de texto a número
    const categorias: { [key: string]: number } = {
      'Local': 0,
      'Restaurante': 1,
      'tienda': 2,
      'bar': 3
    };
    
    // Construir el objeto en el formato del backend
    const datosParaBackend = {
      name: form.value.nombre || '',
      address: form.value.ubicacion || '',
      category: categorias[form.value.tipo] || 0,
      preorder_enabled: form.value.preorder || false,
      ps_enabled: form.value.psEnabled !== undefined ? form.value.psEnabled : true,
      opening_times: openingTimes,
      closing_times: closingTimes,
      payment_methods: [
        form.value.pagoEfectivo !== undefined ? form.value.pagoEfectivo : true,
        form.value.pagoDebito !== undefined ? form.value.pagoDebito : true,
        form.value.pagoCredito !== undefined ? form.value.pagoCredito : true,
        form.value.pagoTransferencia !== undefined ? form.value.pagoTransferencia : true
      ],
      user_id: this.userId
    };
    
    console.log('🏪 Datos para el backend:', datosParaBackend);
    console.log('📄 JSON:', JSON.stringify(datosParaBackend, null, 2));
    
    // Enviar al backend
    this.enviarComercio(datosParaBackend);
  }

  enviarComercio(datos: any) {
    const formData = new FormData();
    
    // Agregar todos los datos como JSON string
    formData.append('data', JSON.stringify(datos));
    
    // Agregar el logo si existe
    if (this.archivoLogo) {
      formData.append('logo', this.archivoLogo);
    }
    
    // Enviar al backend
    this.miApiService.postStores(formData).subscribe(
      response => {
        console.log('✅ Comercio creado exitosamente:', response);
        this.router.navigate(['/escanear']);
      },
      error => {
        console.error('❌ Error al crear comercio:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    );
  }

  onSubmitUnirse(form: NgForm) {
    console.log('Código para unirse:', form.value.codigo);
    // Aquí harías la llamada al API para unirse a un comercio
    // this.miApiService.unirseAComercio(form.value.codigo).subscribe(...)
    this.router.navigate(['/escanear']);
  }

  mostrarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.archivoLogo = input.files[0];
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenUrl = reader.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // Método auxiliar para convertir hora a ISO
  convertirHoraAISO(hora: string): string {
    // hora viene como "09:30"
    const [horas, minutos] = hora.split(':');
    const fecha = new Date();
    fecha.setUTCHours(parseInt(horas), parseInt(minutos), 0, 0);
    return fecha.toISOString();
  }
}