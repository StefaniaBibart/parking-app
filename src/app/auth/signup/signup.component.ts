import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ValidationService } from '../../shared/services/validation.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading: boolean = false;
  hidePassword = true;
  hideConfirmPassword = true;
  
  constructor(
    private router: Router,
    private validationService: ValidationService,
    private fb: FormBuilder
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  get username() { return this.signupForm.get('username'); }
  get email() { return this.signupForm.get('email'); }
  get phoneNumber() { return this.signupForm.get('phoneNumber'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }

  getUsernameError(): string {
    if (this.username?.hasError('required')) {
      return 'You must enter a username';
    }
    return '';
  }

  getEmailError(): string {
    if (this.email?.hasError('required')) {
      return 'You must enter an email';
    }
    if (this.email?.hasError('email')) {
      return 'Not a valid email';
    }
    return '';
  }

  getPhoneNumberError(): string {
    if (this.phoneNumber?.hasError('required')) {
      return 'You must enter a phone number';
    }
    
    const phoneValue = this.phoneNumber?.value || '';
    if (phoneValue && !this.validationService.validatePhoneNumber(phoneValue)) {
      return this.validationService.getPhoneNumberErrorMessage(phoneValue);
    }
    
    return '';
  }

  getPasswordError(): string {
    if (this.password?.hasError('required')) {
      return 'You must enter a password';
    }
    if (this.password?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  getConfirmPasswordError(): string {
    if (this.confirmPassword?.hasError('required')) {
      return 'You must confirm your password';
    }
    
    const passwordValue = this.password?.value || '';
    const confirmValue = this.confirmPassword?.value || '';
    
    if (passwordValue && confirmValue && passwordValue !== confirmValue) {
      return 'Passwords do not match';
    }
    
    return '';
  }
  
  validatePhoneNumber(): void {
    const phoneValue = this.phoneNumber?.value || '';
    if (phoneValue && !this.validationService.validatePhoneNumber(phoneValue)) {
      this.phoneNumber?.setErrors({ invalidFormat: true });
    }
  }
  
  validatePasswordMatch(): void {
    const passwordValue = this.password?.value || '';
    const confirmValue = this.confirmPassword?.value || '';
    
    if (passwordValue && confirmValue && passwordValue !== confirmValue) {
      this.confirmPassword?.setErrors({ mismatch: true });
    }
  }
  
  onPhoneNumberKeyPress(event: KeyboardEvent): boolean {
    return this.validationService.onPhoneNumberKeyPress(event);
  }

  onSignup() {
    this.validatePhoneNumber();
    this.validatePasswordMatch();
    
    if (this.signupForm.valid) {
      this.isLoading = true;
      
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      }, 1500);
    } else {
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
    }
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }
}
