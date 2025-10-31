import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation-code',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Confirm.component.html',
  styleUrls: ['./Confirm.component.scss']
})
export class ConfirmComponent {
  constructor(private router: Router) {}

  goToApp() {
    this.router.navigate(['/home']);
  }
}
