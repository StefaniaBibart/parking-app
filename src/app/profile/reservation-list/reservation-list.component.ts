import { Component, effect, inject} from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { Reservation } from '../../shared/models/reservation.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '../../shared/services/auth.service';

@Component({
    selector: 'app-reservation-list',
    imports: [MaterialModule, CommonModule],
    templateUrl: './reservation-list.component.html',
    styleUrls: ['./reservation-list.component.css']
})
export class ReservationListComponent{
  authService = inject(AuthService);
  activeTab = 'upcoming';

  upcomingReservations: Reservation[] = [];
  pastReservations: Reservation[] = [];

  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly dialog = inject(MatDialog);

  constructor() {
    effect(() => {
      const user = this.authService.user();
      const status = this.authService.userResource.status();

      if (status === 'resolved' && !user) {
        this.router.navigate(['/login']);
        return;
      }
      if (user) {
        this.loadReservations();
      }
    });
  }

  async loadReservations() {
    try {
      this.upcomingReservations =
        await this.dataService.getUpcomingReservations();
      this.pastReservations = await this.dataService.getPastReservations();
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  async deleteReservation(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        title: 'Cancel Reservation',
        message: 'Are you sure you want to cancel this reservation?',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.dataService.deleteReservation(id);
          await this.loadReservations();
        } catch (error) {
          console.error('Error deleting reservation:', error);
        }
      }
    });
  }

  async editReservation(reservation: Reservation) {
    this.router.navigate(['/reservations', reservation.id, 'edit']);
  }

  createNewReservation() {
    this.router.navigate(['/reservations/new']);
  }

  isSameDay(date1: Date | string, date2: Date | string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
}
