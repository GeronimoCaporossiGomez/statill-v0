// src/app/pages/metodo-pago-no-disponible/metodo-pago-no-disponible.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-metodo-pago-no-disponible',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="no-disponible-container">
      <div class="no-disponible-card">
        <div class="icon">⚠️</div>
        <h1>Método de Pago No Disponible</h1>
        <p class="message">
          Por el momento, solo aceptamos pagos en <strong>efectivo</strong> al momento de retirar tu pedido.
        </p>
        <p class="info">
          Estamos trabajando para incorporar más métodos de pago próximamente.
        </p>
        <div class="actions">
          <button class="btn-primary" [routerLink]="['/home']">
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .no-disponible-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .no-disponible-card {
      background: white;
      border-radius: 24px;
      padding: 3rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .icon {
      font-size: 5rem;
      margin-bottom: 1.5rem;
    }
    
    h1 {
      color: #f57c00;
      margin: 0 0 1.5rem 0;
      font-size: 1.8rem;
    }
    
    .message {
      font-size: 1.1rem;
      color: #333;
      margin-bottom: 1rem;
      line-height: 1.6;
    }
    
    .info {
      font-size: 0.95rem;
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.5;
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .btn-primary {
      padding: 1rem 2rem;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: #45a049;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
      }
    }
    
    @media (max-width: 768px) {
      .no-disponible-card {
        padding: 2rem 1.5rem;
      }
      
      .icon {
        font-size: 4rem;
      }
      
      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class MetodoPagoNoDisponibleComponent {}