import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { AuthService } from '../shared/services/auth.service';
import { AdminService } from '../shared/services/admin.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  async navigateToSmartParking() {
    if (this.authService.getCurrentUser()) {
      const isAdmin = await this.adminService.isAdminAsync();
      if (isAdmin) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/reservations/new']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToNewReservation() {
    this.router.navigate(['/reservations/new']);
  }
}
