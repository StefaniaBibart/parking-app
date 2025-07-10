import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material.module';

import { AuthService } from '../../shared/services/auth.service';
import { catchError, finalize, switchMap, take, skip } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-login',
    imports: [MaterialModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  errorMessage = '';

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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

  // TODO: refactor
  onLogin() {
    if (!this.loginForm.valid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService
      .login(email, password)
      .pipe(
        switchMap(() => this.authService.isAdmin$.pipe(skip(1), take(1))),
        catchError((error) => {
          this.errorMessage = this.getErrorMessage(error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(isAdmin => {
        if (isAdmin === null) return;
        
        if (isAdmin) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      });
  }

  onSignup() {
    this.router.navigate(['/signup']);
  }

  // TODO: change with new cases
  private getErrorMessage(error: any): string {
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
