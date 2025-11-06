import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ProductoData {
  name: string;
  brand: string;
  price: number;
  points_price: number;
  type: number;
  quantity: number;
  desc: string;
  barcode: string;
  hidden: boolean;
  store_id: number;
}

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.scss']
})
export class ProductoFormComponent implements OnInit {
  @Input() producto: ProductoData = {
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
  
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() showForm: boolean = false;
  @Input() title: string = 'Crear Producto';
  @Input() submitButtonText: string = 'Crear Producto';
  @Input() showBarcodeField: boolean = true;
  @Input() showStoreIdField: boolean = true;
  @Input() suggestedData: any = null; // Datos sugeridos para autocompletar

  @Output() onSubmit = new EventEmitter<ProductoData>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onReset = new EventEmitter<void>();
  @Output() onUseSuggestedData = new EventEmitter<boolean>();

  tiposProducto = [
    { id: 0, name: 'Restaurante' },
    { id: 1, name: 'Kiosco' },
    { id: 2, name: 'Supermercado' },
    { id: 3, name: 'Panadería' },
    { id: 4, name: 'Farmacia' },
    { id: 5, name: 'Electrónica' },
    { id: 6, name: 'Ropa' },
    { id: 7, name: 'Hogar' },
    { id: 8, name: 'Otro' }
  ];

  useSuggestedData: boolean = false;

  ngOnInit() {
    // Si hay datos sugeridos, preguntar si quiere usarlos
    if (this.suggestedData && this.suggestedData.length > 0) {
      this.useSuggestedData = true;
      this.applySuggestedData();
    }

    // Si el store_id ya está establecido desde el padre, no mostrar el campo
    if (this.producto.store_id && this.producto.store_id > 0) {
      this.showStoreIdField = false;
    }
  }

  applySuggestedData() {
    if (this.suggestedData && this.suggestedData.length > 0) {
      // Calcular los datos más comunes
      const mostCommonData = this.calculateMostCommonData(this.suggestedData);
      
      this.producto = {
        ...this.producto,
        name: mostCommonData.name || '',
        brand: mostCommonData.brand || '',
        desc: mostCommonData.desc || '',
        type: mostCommonData.type || 1
      };
    }
  }

  calculateMostCommonData(products: any[]) {
    // Encontrar el nombre más común
    const nameCounts = products.reduce((acc, product) => {
      const name = product.name || '';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonName = Object.keys(nameCounts).reduce((a, b) => 
      nameCounts[a] > nameCounts[b] ? a : b, '');

    // Encontrar la marca más común
    const brandCounts = products.reduce((acc, product) => {
      const brand = product.brand || '';
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonBrand = Object.keys(brandCounts).reduce((a, b) => 
      brandCounts[a] > brandCounts[b] ? a : b, '');

    // Encontrar la descripción más común
    const descCounts = products.reduce((acc, product) => {
      const desc = product.desc || '';
      acc[desc] = (acc[desc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonDesc = Object.keys(descCounts).reduce((a, b) => 
      descCounts[a] > descCounts[b] ? a : b, '');

    // Encontrar el tipo más común
    const typeCounts = products.reduce((acc, product) => {
      const type = product.type || 1;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    const mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[Number(a)] > typeCounts[Number(b)] ? a : b, '1');

    return {
      name: mostCommonName,
      brand: mostCommonBrand,
      desc: mostCommonDesc,
      type: Number(mostCommonType)
    };
  }

  toggleSuggestedData() {
    this.useSuggestedData = !this.useSuggestedData;
    this.onUseSuggestedData.emit(this.useSuggestedData);
    
    if (this.useSuggestedData) {
      this.applySuggestedData();
    } else {
      // Limpiar los campos que se llenaron con datos sugeridos
      this.producto.name = '';
      this.producto.brand = '';
      this.producto.desc = '';
      this.producto.type = 1;
    }
  }

  submitForm() {
    if (!this.producto.name || !this.producto.price) {
      this.errorMessage = 'Complete al menos el nombre y precio del producto';
      return;
    }

    // Asegurar que los tipos de datos sean correctos
    const productoData: ProductoData = {
      name: this.producto.name.trim(),
      brand: this.producto.brand.trim() || 'Sin marca',
      price: Number(this.producto.price),
      points_price: Number(this.producto.points_price) || 1,
      type: Number(this.producto.type) || 1,
      quantity: Number(this.producto.quantity) || 0,
      desc: this.producto.desc.trim(),
      barcode: this.producto.barcode.trim(),
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
    this.useSuggestedData = false;
    this.onReset.emit();
  }

  getTypeNameById(typeId: number): string {
    const tipo = this.tiposProducto.find(t => t.id === typeId);
    return tipo ? tipo.name : 'Sin categoría';
  }
}
