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
import { AdminGuard } from './shared/guards/admin.guard';
import { UserGuard } from './shared/guards/user.guard';
import { RootRedirectGuard } from './shared/guards/root-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    component: PlaceholderComponent,
    canActivate: [RootRedirectGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [UserGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard, UserGuard],
  },
  {
    path: 'reservations',
    component: ReservationListComponent,
    canActivate: [AuthGuard, UserGuard],
  },
  {
    path: 'reservations/new',
    component: ReservationFormComponent,
    canActivate: [AuthGuard, UserGuard],
  },
  {
    path: 'reservations/:id/edit',
    component: ReservationFormComponent,
    canActivate: [AuthGuard, UserGuard],
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'admin/reservations',
    component: AdminReservationsListComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'admin/reservations/:id/edit',
    component: ReservationFormComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'admin/parking-spots',
    component: AdminParkingSpotsComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  { path: '**', redirectTo: '/home' },
];
