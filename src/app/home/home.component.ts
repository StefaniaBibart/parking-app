import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MaterialModule } from '../material.module';
import { AuthService } from '../shared/services/auth.service';

@Component({
    selector: 'app-home',
    imports: [MaterialModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  async navigateToSmartParking() {
    if (await this.authService.user()) {
      const isAdmin = this.authService.isAdmin();
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
