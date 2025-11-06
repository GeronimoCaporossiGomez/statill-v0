import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-producto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-producto-form.component.html',
  styleUrls: ['./crear-producto-form.component.scss']
})
export class CrearProductoFormComponent {
  @Input() producto: any = {};
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() showForm: boolean = false;
  @Input() title: string = 'Crear Producto';
  @Input() submitButtonText: string = 'Crear Producto';

  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onReset = new EventEmitter<void>();

  tiposProducto = [
    { id: 0, name: 'Restaurante' },
    { id: 1, name: 'Kiosco' },
    { id: 2, name: 'Supermercado' },
    { id: 3, name: 'Panadería' }
  ];

  // Inicializar producto con estructura correcta
  ngOnInit() {
    if (!this.producto || Object.keys(this.producto).length === 0) {
      this.producto = {
        name: '',
        brand: '',
        price: 0,
        points_price: 1,
        type: 1,
        quantity: 0,
        desc: '',
        barcode: '',
        hidden: false,
        store_id: this.producto?.store_id || 1
      };
    }
  }

  submitForm() {
    if (!this.producto.name || !this.producto.price) {
      this.errorMessage = 'Complete al menos el nombre y precio del producto';
      return;
    }

    // Asegurar que los tipos de datos sean correctos
    const productoData = {
      name: this.producto.name,
      brand: this.producto.brand || 'Sin marca',
      price: Number(this.producto.price),
      points_price: Number(this.producto.points_price) || 1,
      type: Number(this.producto.type) || 1,
      quantity: Number(this.producto.quantity) || 0,
      desc: this.producto.desc || '',
      barcode: this.producto.barcode || '',
      hidden: Boolean(this.producto.hidden),
      store_id: Number(this.producto.store_id) || 1
    };

    this.onSubmit.emit(productoData);
  }

  cancelForm() {
    this.onCancel.emit();
  }

  resetForm() {
    this.producto = {
      name: '',
      brand: '',
      price: 0,
      points_price: 1,
      type: 1,
      quantity: 0,
      desc: '',
      barcode: '',
      hidden: false,
      store_id: 1
    };
    this.onReset.emit();
  }

  getTypeNameById(typeId: number): string {
    const tipo = this.tiposProducto.find(t => t.id === typeId);
    return tipo ? tipo.name : 'Sin categoría';
  }
}
