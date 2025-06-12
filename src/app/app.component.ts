// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // ✅ IMPORTACIÓN OBLIGATORIA

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // ✅ IMPORTACIÓN DECLARADA
  template: `<router-outlet></router-outlet>`  // ✅ Punto de carga de páginas
})
export class AppComponent {

}
