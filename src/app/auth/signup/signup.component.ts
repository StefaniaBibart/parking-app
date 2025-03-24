import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [MaterialModule, FormsModule, CommonModule,],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  phoneNumber: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;

  constructor(private router: Router) {}

  isFormValid(): boolean {
    return (
      this.username.trim() !== '' &&
      this.email.trim() !== '' &&
      this.phoneNumber.trim() !== '' &&
      this.password.trim() !== '' &&
      this.confirmPassword.trim() !== '' &&
      this.password === this.confirmPassword
    );
  }

  onSignup() {
    if (this.isFormValid()) {
      this.isLoading = true;
      console.log('Signup attempt with:', this.username, this.email, this.phoneNumber);
      
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      }, 1500);
    }
  }

  onLogin() {
    this.router.navigate(['/login']);
  }
}
