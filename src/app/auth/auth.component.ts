import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-auth',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  isLogin: boolean = true;

  constructor(private route: ActivatedRoute) {
    // 📦 Lee parámetro de query: ?mode=register
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'register') {
        this.isLogin = false;
      }
    });
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
  }
}
