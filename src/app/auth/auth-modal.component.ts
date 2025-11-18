import { Router } from '@angular/router';
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  animations: [
    trigger('fadeSlide', [
      state('login', style({ opacity: 1, transform: 'translateY(0)' })),
      state('register', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('login <=> register', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out'),
      ]),
    ]),
  ],
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();

    public resAreas: readonly { p: string; n: string }[] = [
    {
      p: 'CABA',
      n: 'Comuna 1',
    },
    {
      p: 'CABA',
      n: 'Comuna 2',
    },
    {
      p: 'CABA',
      n: 'Comuna 3',
    },
    {
      p: 'CABA',
      n: 'Comuna 4',
    },
    {
      p: 'CABA',
      n: 'Comuna 5',
    },
    {
      p: 'CABA',
      n: 'Comuna 6',
    },
    {
      p: 'CABA',
      n: 'Comuna 7',
    },
    {
      p: 'CABA',
      n: 'Comuna 8',
    },
    {
      p: 'CABA',
      n: 'Comuna 9',
    },
    {
      p: 'CABA',
      n: 'Comuna 10',
    },
    {
      p: 'CABA',
      n: 'Comuna 11',
    },
    {
      p: 'CABA',
      n: 'Comuna 12',
    },
    {
      p: 'CABA',
      n: 'Comuna 13',
    },
    {
      p: 'CABA',
      n: 'Comuna 14',
    },
    {
      p: 'CABA',
      n: 'Comuna 15',
    },
    { p: 'PBA', n: 'Adolfo Alsina' },
    { p: 'PBA', n: 'Adolfo Gonzales Chaves' },
    { p: 'PBA', n: 'Alberti' },
    { p: 'PBA', n: 'Almirante Brown' },
    { p: 'PBA', n: 'Arrecifes' },
    { p: 'PBA', n: 'Avellaneda' },
    { p: 'PBA', n: 'Ayacucho' },
    { p: 'PBA', n: 'Azul' },
    { p: 'PBA', n: 'Bahía Blanca' },
    { p: 'PBA', n: 'Balcarce' },
    { p: 'PBA', n: 'Baradero' },
    { p: 'PBA', n: 'Benito Juárez' },
    { p: 'PBA', n: 'Berazategui' },
    { p: 'PBA', n: 'Berisso' },
    { p: 'PBA', n: 'Bolívar' },
    { p: 'PBA', n: 'Bragado' },
    { p: 'PBA', n: 'Brandsen' },
    { p: 'PBA', n: 'Campana' },
    { p: 'PBA', n: 'Cañuelas' },
    { p: 'PBA', n: 'Capitán Sarmiento' },
    { p: 'PBA', n: 'Carlos Casares' },
    { p: 'PBA', n: 'Carlos Tejedor' },
    { p: 'PBA', n: 'Carmen de Areco' },
    { p: 'PBA', n: 'Castelli' },
    { p: 'PBA', n: 'Chacabuco' },
    { p: 'PBA', n: 'Chascomús' },
    { p: 'PBA', n: 'Chivilcoy' },
    { p: 'PBA', n: 'Colón' },
    { p: 'PBA', n: 'Coronel de Marina Leonardo Rosales' },
    { p: 'PBA', n: 'Coronel Dorrego' },
    { p: 'PBA', n: 'Coronel Pringles' },
    { p: 'PBA', n: 'Daireaux' },
    { p: 'PBA', n: 'Ensenada' },
    { p: 'PBA', n: 'Escobar' },
    { p: 'PBA', n: 'Esteban Echeverría' },
    { p: 'PBA', n: 'Exaltación de la Cruz' },
    { p: 'PBA', n: 'Ezeiza' },
    { p: 'PBA', n: 'Florencio Varela' },
    { p: 'PBA', n: 'Florentino Ameghino' },
    { p: 'PBA', n: 'General Alvarado' },
    { p: 'PBA', n: 'General Alvear' },
    { p: 'PBA', n: 'General Arenales' },
    { p: 'PBA', n: 'General Belgrano' },
    { p: 'PBA', n: 'General Guido' },
    { p: 'PBA', n: 'General Juan Madriaga' },
    { p: 'PBA', n: 'General La Madrid' },
    { p: 'PBA', n: 'General Las Heras' },
    { p: 'PBA', n: 'General Lavalle' },
    { p: 'PBA', n: 'General Paz' },
    { p: 'PBA', n: 'General Pinto' },
    { p: 'PBA', n: 'General Pueyrredón' },
    { p: 'PBA', n: 'General Rodríguez' },
    { p: 'PBA', n: 'General San Martín' },
    { p: 'PBA', n: 'General Viamonte' },
    { p: 'PBA', n: 'General Villegas' },
    { p: 'PBA', n: 'Guaminí' },
    { p: 'PBA', n: 'Hipólito Yrigoyen' },
    { p: 'PBA', n: 'Hurlingham' },
    { p: 'PBA', n: 'Ituzaingó' },
    { p: 'PBA', n: 'José C. Paz' },
    { p: 'PBA', n: 'Junín' },
    { p: 'PBA', n: 'La Costa' },
    { p: 'PBA', n: 'La Matanza' },
    { p: 'PBA', n: 'La Plata' },
    { p: 'PBA', n: 'Lanús' },
    { p: 'PBA', n: 'Laprida' },
    { p: 'PBA', n: 'Las Flores' },
    { p: 'PBA', n: 'Leandro N. Alem' },
    { p: 'PBA', n: 'Lezama' },
    { p: 'PBA', n: 'Lincoln' },
    { p: 'PBA', n: 'Lobería' },
    { p: 'PBA', n: 'Lobos' },
    { p: 'PBA', n: 'Lomas de Zamora' },
    { p: 'PBA', n: 'Luján' },
    { p: 'PBA', n: 'Magdalena' },
    { p: 'PBA', n: 'Maipú' },
    { p: 'PBA', n: 'Malvinas Argentinas' },
    { p: 'PBA', n: 'Mar Chiquita' },
    { p: 'PBA', n: 'Marcos Paz' },
    { p: 'PBA', n: 'Mercedes' },
    { p: 'PBA', n: 'Merlo' },
    { p: 'PBA', n: 'Monte' },
    { p: 'PBA', n: 'Monte Hermoso' },
    { p: 'PBA', n: 'Moreno' },
    { p: 'PBA', n: 'Morón' },
    { p: 'PBA', n: 'Navarro' },
    { p: 'PBA', n: 'Necochea' },
    { p: 'PBA', n: 'Nueve de Julio' },
    { p: 'PBA', n: 'Olavarría' },
    { p: 'PBA', n: 'Pehuajó' },
    { p: 'PBA', n: 'Pellegrini' },
    { p: 'PBA', n: 'Pergamino' },
    { p: 'PBA', n: 'Pila' },
    { p: 'PBA', n: 'Pilar' },
    { p: 'PBA', n: 'Pinamar' },
    { p: 'PBA', n: 'Presidente Perón' },
    { p: 'PBA', n: 'Puan' },
    { p: 'PBA', n: 'Punta Indio' },
    { p: 'PBA', n: 'Quilmes' },
    { p: 'PBA', n: 'Ramallo' },
    { p: 'PBA', n: 'Rauch' },
    { p: 'PBA', n: 'Rivadavia' },
    { p: 'PBA', n: 'Rojas' },
    { p: 'PBA', n: 'Roque Pérez' },
    { p: 'PBA', n: 'Saavedra' },
    { p: 'PBA', n: 'Salliqueló' },
    { p: 'PBA', n: 'Salto' },
    { p: 'PBA', n: 'San Andrés de Giles' },
    { p: 'PBA', n: 'San Antonio de Areco' },
    { p: 'PBA', n: 'San Cayetano' },
    { p: 'PBA', n: 'San Fernando' },
    { p: 'PBA', n: 'San Isidro' },
    { p: 'PBA', n: 'San Miguel' },
    { p: 'PBA', n: 'San Pedro' },
    { p: 'PBA', n: 'San Vicente' },
    { p: 'PBA', n: 'Suipacha' },
    { p: 'PBA', n: 'Tandil' },
    { p: 'PBA', n: 'Tapalqué' },
    { p: 'PBA', n: 'Tigre' },
    { p: 'PBA', n: 'Tordillo' },
    { p: 'PBA', n: 'Tornquist' },
    { p: 'PBA', n: 'Trenque Lauquen' },
    { p: 'PBA', n: 'Tres Arroyos' },
    { p: 'PBA', n: 'Tres de Febrero' },
    { p: 'PBA', n: 'Tres Lomas' },
    { p: 'PBA', n: 'Veinticinco de Mayo' },
    { p: 'PBA', n: 'Vicente López' },
    { p: 'PBA', n: 'Villa Gesell' },
    { p: 'PBA', n: 'Villarino' },
    { p: 'PBA', n: 'Zárate' },
    {
      p: 'Catamarca',
      n: 'Provincia de Catamarca',
    },
    {
      p: 'Chaco',
      n: 'Provincia del Chaco',
    },
    {
      p: 'Chubut',
      n: 'Provincia del Chubut',
    },
    {
      p: 'Córdoba',
      n: 'Provincia de Córdoba',
    },
    {
      p: 'Corrientes',
      n: 'Provincia de Corrientes',
    },
    {
      p: 'Entre Ríos',
      n: 'Provincia de Entre Ríos',
    },
    {
      p: 'Formosa',
      n: 'Provincia de Formosa',
    },
    {
      p: 'Jujuy',
      n: 'Provincia de Jujuy',
    },
    {
      p: 'La Pampa',
      n: 'Provincia de La Pampa',
    },
    {
      p: 'La Rioja',
      n: 'Provincia de La Rioja',
    },
    {
      p: 'Mendoza',
      n: 'Provincia de Mendoza',
    },
    {
      p: 'Misiones',
      n: 'Provincia de Misiones',
    },
    {
      p: 'Neuquén',
      n: 'Provincia del Neuquén',
    },
    {
      p: 'Río Negro',
      n: 'Provincia de Río Negro',
    },
    {
      p: 'Salta',
      n: 'Provincia de Salta',
    },
    {
      p: 'San Juan',
      n: 'Provincia de San Juan',
    },
    {
      p: 'San Luis',
      n: 'Provincia de San Luis',
    },
    {
      p: 'Santa Cruz',
      n: 'Provincia de Santa Cruz',
    },
    {
      p: 'Santa Fe',
      n: 'Provincia de Santa Fe',
    },
    {
      p: 'Santiago del Estero',
      n: 'Provincia de Santiago del Estero',
    },
    {
      p: 'Tierra del Fuego',
      n: 'Tierra del Fuego, Antártida e Islas del Atlántico Sur',
    },
    {
      p: 'Tucumán',
      n: 'Provincia de Tucumán',
    },
  ];

  // it's a kind of magic
  get groupedAreas() {
    const priority = ['CABA', 'PBA'];

    const map = this.resAreas.reduce((groups, item) => {
      if (!groups[item.p]) {
        groups[item.p] = [];
      }
      groups[item.p].push(item);
      return groups;
    }, {} as Record<string, { p: string; n: string }[]>);

    const entries = Object.entries(map).map(([key, value]) => ({ key, value }));

    entries.sort((a, b) => {
      const ai = priority.indexOf(a.key);
      const bi = priority.indexOf(b.key);

      if (ai !== -1 && bi !== -1) return ai - bi;

      if (ai !== -1) return -1;

      if (bi !== -1) return 1;

      return a.key.localeCompare(b.key);
    });

    return entries;
  }

  // Getter para la fecha máxima permitida (13 años atrás)
  get maxBirthdate(): string {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  }

  isLogin = true;
  // Registration fields
  first_names = '';
  last_name = '';
  email = '';
  password = '';
  birthdate = '';
  gender = '';
  res_area = this.resAreas.find(a => a.p === 'CABA' && a.n === 'Comuna 1');

  // For error/success messages
  message = '';
  messageType: 'success' | 'error' | '' = '';
  loading = false;

  constructor(private router: Router, private authService: AuthService) {}

  toggleMode(value: boolean) {
    this.isLogin = value;
    this.message = '';
    this.messageType = '';
    // reset fields
  }

  submitForm() {
    this.message = '';
    this.messageType = '';
    this.loading = true;
    if (this.isLogin) {
      // Login with email and password
      this.authService
        .requestToken({
          grant_type: 'password',
          username: this.email,
          password: this.password,
        })
        .subscribe({
          next: (response) => {
            this.loading = false;
            // Check if user needs to verify email
            const user = this.authService.getCurrentUser();
            if (user && !user.email_verified) {
              this.message =
                'Por favor, verifique su email antes de continuar.';
              this.messageType = 'error';
              // send verification code and redirect to confirmation route
              this.authService.sendEmailVerificationCode().subscribe({
                next: () => {
                  this.close.emit();
                  this.router.navigate(['/confirmacion-codigo']);
                },
                error: () => {
                  // even if sending fails, still navigate so user can try
                  this.close.emit();
                  this.router.navigate(['/confirmacion-codigo']);
                },
              });
            } else {
              this.message = '¡Bienvenido!';
              this.messageType = 'success';
              setTimeout(() => {
                this.close.emit();
                this.router.navigate(['/home']);
              }, 1000);
            }
          },
          error: (err) => {
            this.loading = false;
            this.message =
              err.error?.message ||
              'Error de autenticación. Verifique el email y la contraseña.';
            this.messageType = 'error';
          },
        });
    } else {
      // Validar edad mínima antes de registrar
      const birthDate = new Date(this.birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 13) {
        this.loading = false;
        this.message = 'Debes tener al menos 13 años para registrarte.';
        this.messageType = 'error';
        return;
      }

      // Register new user
      this.authService
        .registerUser({
          first_names: this.first_names,
          last_name: this.last_name,
          email: this.email,
          password: this.password,
          birthdate: this.birthdate,
          gender: this.gender,
          res_area: `${this.res_area.p} ${this.res_area.n}`, // temporary until we get proper geocoding approval
        })
        .subscribe({
          next: (res) => {
              // After successful registration, automatically log in the user
            this.authService
              .requestToken({
                grant_type: 'password',
                username: this.email,
                password: this.password,
              })
              .subscribe({
                next: (tokenRes) => {
                  this.loading = false;
                  this.message =
                    'Registro exitoso. Se ha enviado un código de verificación a tu email.';
                  this.messageType = 'success';
                  // Close modal and redirect to confirmation page
                  setTimeout(() => {
                    this.close.emit();
                    this.router.navigate(['/confirmacion-codigo']);
                  }, 500);
                },
                error: (err) => {
                  this.loading = false;
                  this.message =
                    'Registro exitoso pero hay un problema al iniciar sesión. Por favor, intente iniciar sesión manualmente.';
                  this.messageType = 'error';
                },
              });
          },
          error: (err) => {
            this.loading = false;
            this.message =
              err.error?.message ||
              'Error al registrarse. Revise los datos ingresados.';
            this.messageType = 'error';
          },
        });
    }
  }
}