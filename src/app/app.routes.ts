import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';
import { UserProfileComponent } from './profile/user-profile/user-profile.component';
import { ReservationListComponent } from './profile/reservation-list/reservation-list.component';
import { ReservationFormComponent } from './reservations/reservation-form/reservation-form.component';
import { SpotSelectionComponent } from './reservations/spot-selection/spot-selection.component';
import { AdminDashboardComponent } from './admin/dashboard/admin-dashboard.component';
import { AdminParkingSpotsComponent } from './admin/parking-spots/admin-parking-spots.component';
import { AuthGuard } from './auth/auth.guard';
import { AdminReservationsListComponent } from './admin/reservations-list/admin-reservations-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'reservations',
    component: ReservationListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'new-reservation',
    component: ReservationFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'select-spot',
    component: SpotSelectionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/reservations',
    component: AdminReservationsListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/parking-spots',
    component: AdminParkingSpotsComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/home' },
];
