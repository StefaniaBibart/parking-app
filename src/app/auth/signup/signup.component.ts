import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ValidationService } from '../../shared/services/validation.service';
import { AuthService } from '../../shared/services/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-signup',
    imports: [MaterialModule, ReactiveFormsModule],
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading: boolean = false;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private validationService: ValidationService,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  get username() {
    return this.signupForm.get('username');
  }
  get email() {
    return this.signupForm.get('email');
  }
  get phoneNumber() {
    return this.signupForm.get('phoneNumber');
  }
  get password() {
    return this.signupForm.get('password');
  }
  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

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

  // TODO: refactor to have this logic only in auth.service
  onSignup() {
    this.validatePhoneNumber();
    this.validatePasswordMatch();

    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const email = this.email?.value;
      const password = this.password?.value;
      const username = this.username?.value;
      const phoneNumber = this.phoneNumber?.value;

      // TODO: only in auth.service
      this.authService
        .signup(email, password, username, phoneNumber)
        .pipe(
          catchError((error) => {
            this.errorMessage = this.getSignupErrorMessage(error);
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
          }),
        )
        .subscribe((result) => {
          if (result) {
            this.router.navigate(['/home']);
          }
        });
    } else {
      Object.keys(this.signupForm.controls).forEach((key) => {
        this.signupForm.get(key)?.markAsTouched();
      });
    }
  }

  onLogin() {
    console.log('login redirect signup');
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  private getSignupErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use. Please use a different email or try logging in.';
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      default:
        return 'An error occurred during signup. Please try again.';
    }
  }
}
