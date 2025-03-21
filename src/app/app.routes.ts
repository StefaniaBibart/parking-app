import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { PlaceholderComponent } from './shared/placeholder/placeholder.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: PlaceholderComponent },
  { path: 'profile', component: PlaceholderComponent },
  { path: 'reservations', component: PlaceholderComponent },
  { path: 'new-reservation', component: PlaceholderComponent },
  { path: '**', redirectTo: '/home' }
];
