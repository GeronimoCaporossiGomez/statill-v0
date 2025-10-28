import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';
import { MapaComponent } from 'src/app/mapa/mapa.component';
import { MiApiService } from 'src/app/servicios/mi-api.service';

@Component({
  selector: 'app-crear-comercio',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterLink, MapaComponent],
  templateUrl: './crear-comercio.component.html',
  styleUrl: './crear-comercio.component.scss'
})
export class CrearComercioComponent {
  @ViewChild(MapaComponent) mapaComponent!: MapaComponent;
  
  creando: boolean = true;
  seccionPantalla: number = 0;
  dias: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  imagenUrl: string | ArrayBuffer | null = null;
  archivoLogo: File | null = null;
  userId: number = 1;

  // Variables para el mapa
  direccionInput: string = '';
  ubicacionConfirmada: string = '';
  coordenadasSeleccionadas: [number, number] | null = null;
  buscandoDireccion: boolean = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private miApiService: MiApiService
  ) {}

  aumentarPantalla() {
    this.seccionPantalla += 1;
    if(this.seccionPantalla > 3) {
      this.seccionPantalla = 3;
    }
    
    // ✅ Si llegamos a la pantalla 2 (donde está el mapa), actualizarlo
    if (this.seccionPantalla === 2) {
      setTimeout(() => {
        if (this.mapaComponent && this.mapaComponent.map) {
          this.mapaComponent.map.invalidateSize();
        }
      }, 200);
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

  // Buscar dirección desde el input y mostrarla en el mapa
  buscarDireccionEnMapa() {
    if (this.mapaComponent) {
      this.buscandoDireccion = true;
      this.mapaComponent.direccionInput = this.direccionInput;
      this.mapaComponent.buscarDireccion().finally(() => {
        this.buscandoDireccion = false;
        this.cdr.markForCheck();
      });
    }
  }

  // Cuando se selecciona una ubicación en el mapa (click o búsqueda)
  onUbicacionSeleccionada(coords: [number, number]) {
    this.coordenadasSeleccionadas = coords;
    console.log('📍 Coordenadas seleccionadas:', coords);
  }

  // Cuando se confirma una dirección (desde búsqueda o geocoding inverso)
  onDireccionSeleccionada(direccion: string) {
    this.ubicacionConfirmada = direccion;
    this.direccionInput = direccion;
    console.log('✅ Dirección confirmada:', direccion);
    this.cdr.markForCheck();
  }

  onSubmit(form: NgForm) {
    console.log('📋 Datos del formulario (raw):', form.value);

    // Transformar horarios al formato del backend (solo HH:MM)
    const openingTimes: (string | null)[] = [];
    const closingTimes: (string | null)[] = [];

    this.dias.forEach((dia, i) => {
      const abierto = form.value[`si${i}`];
      const horaInicio = form.value[`horaInicio${i}`];
      const horaFin = form.value[`horaFin${i}`];

      if (abierto && horaInicio) {
        openingTimes.push(horaInicio);
      } else {
        openingTimes.push(null);
      }

      if (abierto && horaFin) {
        closingTimes.push(horaFin);
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

    // Usar la dirección confirmada del mapa o la del input
    const direccionFinal = this.ubicacionConfirmada || this.direccionInput;

    // Construir el objeto en el formato del backend
    const datosParaBackend: any = {
      name: form.value.nombre || '',
      address: direccionFinal,
      category: categorias[form.value.tipo] || 0,
      preorder_enabled: form.value.preorder === true,
      ps_value: 1 , //ESTO HAY QUE HACERLO BIEN, ES DECIR, QUE ESTE CON EL FORM PARA ESO ARREGLAR EL DISEÑO CON EL CSS PORQUE EL MAPA LO ESTA TAPANDO
      opening_times: openingTimes,
      closing_times: closingTimes,
      payment_methods: [
        form.value.pagoEfectivo === true,
        form.value.pagoDebito === true,
        form.value.pagoCredito === true,
        form.value.pagoTransferencia === true
      ],
      user_id: form.value.localsito
    };

    // Si ps_enabled es true, agregar ps_value
    if (datosParaBackend.ps_enabled) {
      datosParaBackend.ps_value = form.value.psValue || 0;
    }

    // Agregar coordenadas si están disponibles
    if (this.coordenadasSeleccionadas) {
      datosParaBackend.latitude = this.coordenadasSeleccionadas[0];
      datosParaBackend.longitude = this.coordenadasSeleccionadas[1];
    }

    console.log('🏪 Datos para el backend:', datosParaBackend);
    console.log('📄 JSON:', JSON.stringify(datosParaBackend, null, 2));

    // Enviar al backend
    this.enviarComercio(datosParaBackend);
  }

  enviarComercio(datos: any) {
    this.miApiService.postStores(datos).subscribe(
      response => {
        console.log('✅ Comercio creado exitosamente:', response);
        this.router.navigate(['/escanear']);
      },
      error => {
        console.error('❌ Error al crear comercio:', error);
        console.error('Detalles:', error.error);
      }
    );
  }

  onSubmitUnirse(form: NgForm) {
    console.log('Código para unirse:', form.value.codigo);
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
}