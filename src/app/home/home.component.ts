import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateToSmartParking() {
    if (this.authService.getCurrentUser()) {
      this.router.navigate(['/new-reservation']);
    } else {
      this.router.navigate(['/login']);
    }
  }
} 