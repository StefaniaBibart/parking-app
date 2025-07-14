import { Component, effect, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material.module';

import { AuthService } from '../../shared/services/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-login',
    imports: [MaterialModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  errorMessage = '';
  isLoading = false;

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    effect(() => {
      const error = this.authService.error();
      if (error !== null && error !== undefined) {
        this.errorMessage = this.getErrorMessage(error);
      } else {
        this.errorMessage = '';
      }
    });

    effect(() => {
      const isLoading = this.authService.isLoading();
      if (isLoading) {
        this.isLoading = true;
      } else {
        this.isLoading = false;
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onLogin() {
    if (!this.loginForm.valid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).pipe(
      catchError((error) => {
        this.errorMessage = this.getErrorMessage(error);
        return of(null);
      }),
      finalize(() => {
        this.isLoading = this.authService.isLoading();
      })
    ).subscribe();
  }

  onSignup() {
    this.router.navigate(['/signup']);
  }

  private getErrorMessage(error: { code: string; message: string } | null): string {
    if (error === null) {
      return '';
    }

    switch (error.code) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/invalid-credential':
        return 'Incorrect password.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later.';
      default:
        return 'An error occurred during login. Please try again.';
    }
  }
}
