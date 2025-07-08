import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit, OnDestroy {
  // Configuraciones disponibles
  userSettings = {
    theme: 'light',
    notifications: true,
    language: 'es',
    fontSize: 'medium'
  };

  // Opciones para los selects
  availableThemes = ['light', 'dark', 'system'];
  availableLanguages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' }
  ];
  fontSizes = ['small', 'medium', 'large'];

  // Para limpiar el timeout (si se usa)
  private settingsTimeout: any;

  ngOnInit() {
    this.loadSettings();
  }

  ngOnDestroy() {
    if (this.settingsTimeout) {
      clearTimeout(this.settingsTimeout);
    }
  }

  // Carga configuraciones guardadas
  private loadSettings() {
    const savedSettings = localStorage.getItem('userAppSettings');
    if (savedSettings) {
      try {
        this.userSettings = { ...this.userSettings, ...JSON.parse(savedSettings) };
        this.applySettings(); // Aplica las configuraciones al cargar
      } catch (e) {
        console.error('Error al cargar configuraciones', e);
      }
    }
  }

  // Guarda configuraciones
  saveSettings() {
    localStorage.setItem('userAppSettings', JSON.stringify(this.userSettings));
    this.applySettings();
    
    // Opcional: Mensaje de confirmación
    alert('Configuraciones guardadas correctamente');
  }

  // Aplica las configuraciones al DOM
  private applySettings() {
    // Aplicar tema
    document.documentElement.setAttribute('data-theme', this.userSettings.theme);
    
    // Aplicar tamaño de fuente
    document.documentElement.style.fontSize = 
      this.userSettings.fontSize === 'small' ? '14px' :
      this.userSettings.fontSize === 'large' ? '18px' : '16px';
    
    // Aquí podrías aplicar el idioma si tienes i18n configurado
  }

  // Restablece a valores por defecto
  resetToDefaults() {
    if (confirm('¿Restablecer configuraciones a valores por defecto?')) {
      this.userSettings = {
        theme: 'light',
        notifications: true,
        language: 'es',
        fontSize: 'medium'
      };
      localStorage.removeItem('userAppSettings');
      this.applySettings();
    }
  }

  // Cambios automáticos (opcional)
  onSettingChange() {
    // Debounce para evitar muchos saves
    if (this.settingsTimeout) clearTimeout(this.settingsTimeout);
    
    this.settingsTimeout = setTimeout(() => {
      this.saveSettings();
    }, 1000);
  }
}