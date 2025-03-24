import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { PlaceholderComponent } from './shared/placeholder/placeholder.component';
import { UserProfileComponent } from './profile/user-profile/user-profile.component';
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'reservations', component: PlaceholderComponent },
  { path: 'new-reservation', component: PlaceholderComponent },
  { path: '**', redirectTo: '/home' }
];
