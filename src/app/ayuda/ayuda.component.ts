import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-ayuda',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class AyudaComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;
  showHelpContent: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Example interval usage
    this.subscription = interval(1000).subscribe(() => {
      console.log('Interval tick');
    });
  }

  toggleHelpContent(): void {
    this.showHelpContent = !this.showHelpContent;
  }

  ngOnDestroy(): void {
    // Clean up the subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}