import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiApiService } from 'src/app/servicios/mi-api.service';

interface Store {
  id: number;
  name: string;
  address: string;
  category: number;
  opening_times: (string | null)[];
  closing_times: (string | null)[];
}

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Stores.component.html',
  styleUrls: ['./Stores.component.scss']
})
export class StoresComponent implements OnInit {
  stores: Store[] = [];

  constructor(private api: MiApiService) {}

  ngOnInit() {
    this.loadStores();
  }

  loadStores() {
    this.api.getStores().subscribe((res: any) => {
      if (res.successful && Array.isArray(res.data)) {
        this.stores = res.data;
      }
    });
  }

  // Parse horario en formato "HH:mm:ss-03:00" o "HH:mm:ss.SSSZ"
  parseTime(str: string): Date | null {
    if (!str) return null;
    // Si es formato "HH:mm:ss-03:00"
    const match = str.match(/^(\d{2}):(\d{2}):(\d{2})(?:-(\d{2}):(\d{2}))?$/);
    if (match) {
      const now = new Date();
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const s = parseInt(match[3], 10);
      // Usar la fecha de hoy con la hora del string
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s);
      return d;
    }
    // Si es formato ISO
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  isOpen(store: Store): { abierto: boolean, horario: string } {
    const now = new Date();
    const day = now.getDay(); // 0=domingo
    const openStr = store.opening_times[day];
    const closeStr = store.closing_times[day];
    if (!openStr || !closeStr) return { abierto: false, horario: 'Cerrado' };

    const open = this.parseTime(openStr);
    const close = this.parseTime(closeStr);
    if (!open || !close) return { abierto: false, horario: 'Cerrado' };

    // Si el cierre es menor que la apertura, es horario nocturno (ej: 22:00 a 06:00)
    let abierto = false;
    if (close > open) {
      abierto = now >= open && now <= close;
    } else {
      abierto = now >= open || now <= close;
    }

    const horario = `${open.getHours().toString().padStart(2, '0')}:${open.getMinutes().toString().padStart(2, '0')} - ${close.getHours().toString().padStart(2, '0')}:${close.getMinutes().toString().padStart(2, '0')}`;
    return { abierto, horario };
  }
}