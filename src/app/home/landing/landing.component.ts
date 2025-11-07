import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthModalComponent } from '../../auth/auth-modal.component';
import { GeneralService } from '../../servicios/general.service';
import { SidebarComponent } from 'src/app/Componentes/sidebar-statill/sidebar.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthModalComponent, SidebarComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  showAuthModal = false;
  users: any[] = [];
  
  constructor(private generalService: GeneralService) {
    // this.generalService.getUsers().subscribe((users: any) => {
    //   this.users = users;
    // });
  }
  
  openAuthModal() {
    this.showAuthModal = true;
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }
}