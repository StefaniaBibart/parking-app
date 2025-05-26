import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { DataService } from '../../shared/services/data.service';
import { Reservation } from '../../shared/models/reservation.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-reservations-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './admin-reservations-list.component.html',
  styleUrls: ['./admin-reservations-list.component.css'],
})
export class AdminReservationsListComponent implements OnInit {
  allReservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  isLoading = true;
  currentDate = new Date();

  filterStatus: 'all' | 'upcoming' | 'active' | 'past' = 'all';
  searchTerm: string = '';

  constructor(
    private dataService: DataService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.loadReservations();
  }

  async loadReservations() {
    this.isLoading = true;
    try {
      this.allReservations = await this.dataService.getAllReservations();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    this.filteredReservations = this.allReservations.filter((reservation) => {
      if (this.filterStatus !== 'all') {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);

        if (this.filterStatus === 'upcoming' && startDate > now) {
        } else if (
          this.filterStatus === 'active' &&
          startDate <= now &&
          endDate >= now
        ) {
        } else if (this.filterStatus === 'past' && endDate < now) {
        } else {
          return false;
        }
      }

      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        return (
          reservation.id?.toString().toLowerCase().includes(searchLower) ||
          (reservation as any).user?.toLowerCase().includes(searchLower) ||
          reservation.vehicle?.toLowerCase().includes(searchLower) ||
          reservation.spot?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    this.filteredReservations.sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  getReservationStatus(
    reservation: Reservation
  ): 'upcoming' | 'active' | 'past' {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);

    if (startDate > now) {
      return 'upcoming';
    } else if (endDate < now) {
      return 'past';
    } else {
      return 'active';
    }
  }

  async cancelReservation(reservation: Reservation) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        title: 'Cancel Reservation',
        message: `Are you sure you want to cancel the reservation for spot ${reservation.spot}?`,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.dataService.deleteReservation(reservation.id);
          this.snackBar.open('Reservation cancelled successfully', 'Close', {
            duration: 3000,
          });
          await this.loadReservations();
        } catch (error) {
          console.error('Error cancelling reservation:', error);
          this.snackBar.open('Failed to cancel reservation', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  isSameDay(date1: string | Date, date2: string | Date): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
}
