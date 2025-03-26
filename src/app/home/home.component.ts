import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
} 