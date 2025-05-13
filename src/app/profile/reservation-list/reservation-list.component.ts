import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { Reservation } from '../../shared/models/reservation.model';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.css'],
})
export class ReservationListComponent implements OnInit {
  activeTab = 'upcoming';

  upcomingReservations: Reservation[] = [];
  pastReservations: Reservation[] = [];

  constructor(private router: Router, private dataService: DataService) {}

  async ngOnInit() {
    await this.loadReservations();
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
    try {
      await this.dataService.deleteReservation(id);
      await this.loadReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  }

  async editReservation(reservation: Reservation) {
    try {
      const vehicles = await this.dataService.getUserVehicles();
      const vehicle = vehicles.find((v) => v.plate === reservation.vehicle);

      if (vehicle) {
        await this.dataService.storeTemporaryReservationData({
          editingReservationId: reservation.id,
          reservationStartDate:
            reservation.startDate instanceof Date
              ? reservation.startDate.toISOString()
              : reservation.startDate.toString(),
          reservationEndDate:
            reservation.endDate instanceof Date
              ? reservation.endDate.toISOString()
              : reservation.endDate.toString(),
          reservationVehicleId: vehicle.id,
        });
      } else {
        console.warn('Vehicle not found in user profile:', reservation.vehicle);
      }

      this.router.navigate(['/new-reservation']);
    } catch (error) {
      console.error('Error preparing reservation for editing:', error);
    }
  }

  async createNewReservation() {
    try {
      await this.dataService.clearTemporaryReservationData();
      this.router.navigate(['/new-reservation']);
    } catch (error) {
      console.error('Error clearing temporary reservation data:', error);
    }
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
