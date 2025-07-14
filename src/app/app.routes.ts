import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';
import { UserProfileComponent } from './profile/user-profile/user-profile.component';
import { ReservationListComponent } from './profile/reservation-list/reservation-list.component';
import { ReservationFormComponent } from './reservations/reservation-form/reservation-form.component';
import { AdminDashboardComponent } from './admin/dashboard/admin-dashboard.component';
import { AdminParkingSpotsComponent } from './admin/parking-spots/admin-parking-spots.component';
import { AdminReservationsListComponent } from './admin/reservations-list/admin-reservations-list.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginGuard } from './auth/login.guard';

export const routes: Routes = [
  {
    path: '',
    component: PlaceholderComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [LoginGuard] },
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
    path: 'reservations/new',
    component: ReservationFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'reservations/:id/edit',
    component: ReservationFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { isAdminRoute: true },
  },
  {
    path: 'admin/reservations',
    component: AdminReservationsListComponent,
    canActivate: [AuthGuard],
    data: { isAdminRoute: true },
  },
  {
    path: 'admin/reservations/:id/edit',
    component: ReservationFormComponent,
    canActivate: [AuthGuard],
    data: { isAdminRoute: true },
  },
  {
    path: 'admin/parking-spots',
    component: AdminParkingSpotsComponent,
    canActivate: [AuthGuard],
    data: { isAdminRoute: true },
  },
  { path: '**', redirectTo: '/home' },
];
