import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { PlaceholderComponent } from './shared/placeholder/placeholder.component';
import { UserProfileComponent } from './profile/user-profile/user-profile.component';
import { ReservationListComponent } from './profile/reservation-list/reservation-list.component';
import { ReservationFormComponent } from './reservations/reservation-form/reservation-form.component';
import { SpotSelectionComponent } from './reservations/spot-selection/spot-selection.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'reservations', component: ReservationListComponent },
  { path: 'new-reservation', component: ReservationFormComponent },
  { path: 'select-spot', component: SpotSelectionComponent },
  { path: '**', redirectTo: '/home' }
];
