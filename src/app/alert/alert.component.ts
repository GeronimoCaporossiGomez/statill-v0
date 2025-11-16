import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {
  @Input() alertText: string = '';
  @Input() isError: boolean = false;
  show = false;
  progress = 100;
  private progressInterval: any;

  // Llama esto para mostrar el alert con animación
  Alert(text: string, isError: boolean = false) {
    // Limpiar cualquier alerta previa
    clearInterval(this.progressInterval);
    this.show = false;
    this.alertText = '';
    this.progress = 100;
    this.isError = isError;

    setTimeout(() => {
      this.alertText = text;
      this.show = true;
      let elapsed = 0;
      const duration = 5000;
      const step = 50;
      clearInterval(this.progressInterval);
      this.progressInterval = setInterval(() => {
        elapsed += step;
        this.progress = 100 - (elapsed / duration) * 100;
        if (elapsed >= duration) {
          clearInterval(this.progressInterval);
          this.show = false;
          this.alertText = '';
          this.progress = 100;
        }
      }, step);
    }, 10);
  }
}
