import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { Reservation } from '../../shared/models/reservation.model';
import { Vehicle } from '../../shared/models/vehicle.model';

@Component({
  selector: 'app-spot-selection',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './spot-selection.component.html',
  styleUrls: ['./spot-selection.component.css'],
})
export class SpotSelectionComponent implements OnInit {
  selectedVehicle: string = '';
  selectedVehicleDetails: Vehicle | null = null;
  selectedSpot: string = '';
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  isEditing = false;
  editingReservationId: number | null = null;

  userVehicles: Vehicle[] = [];

  parkingSpots = [
    { id: 'A1', available: true },
    { id: 'A2', available: true },
    { id: 'A3', available: true },
    { id: 'A4', available: true },
    { id: 'A5', available: true },
    { id: 'B7', available: true },
    { id: 'B8', available: true },
    { id: 'B9', available: true },
    { id: 'B10', available: true },
    { id: 'B11', available: true },
  ];

  constructor(private router: Router, private dataService: DataService) {}

  async ngOnInit() {
    try {
      this.userVehicles = await this.dataService.getUserVehicles();

      const tempData = await this.dataService.getTemporaryReservationData();

      if (tempData.editingReservationId) {
        this.isEditing = true;
        this.editingReservationId = tempData.editingReservationId;
        await this.loadEditingReservation();
      }

      if (tempData.reservationStartDate) {
        this.selectedStartDate = new Date(tempData.reservationStartDate);
      }

      if (tempData.reservationEndDate) {
        this.selectedEndDate = new Date(tempData.reservationEndDate);
      }

      if (tempData.reservationVehicleId) {
        const vehicle = this.userVehicles.find(
          (v) => v.id === tempData.reservationVehicleId
        );
        if (vehicle) {
          this.selectedVehicle = vehicle.plate;
          this.selectedVehicleDetails = vehicle;
        }
      }

      if (
        !this.selectedStartDate ||
        !this.selectedEndDate ||
        !this.selectedVehicle
      ) {
        this.router.navigate(['/new-reservation']);
        return;
      }

      await this.updateAvailableSpots();
    } catch (error) {
      console.error('Error initializing spot selection:', error);
    }
  }

  async loadEditingReservation() {
    if (this.editingReservationId) {
      try {
        const reservations = await this.dataService.getReservations();
        const editingReservation = reservations.find(
          (r) => r.id === this.editingReservationId
        );

        if (editingReservation) {
          this.selectedSpot = editingReservation.spot;

          if (editingReservation.vehicle) {
            const vehicle = this.userVehicles.find(
              (v) => v.plate === editingReservation.vehicle
            );
            if (vehicle) {
              await this.dataService.storeTemporaryReservationData({
                reservationVehicleId: vehicle.id,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading reservation for editing:', error);
      }
    }
  }

  async updateAvailableSpots() {
    if (this.selectedStartDate && this.selectedEndDate) {
      try {
        const reservations = await this.dataService.getAllReservations();

        // Reset all spots to available
        this.parkingSpots.forEach((spot) => (spot.available = true));

        // Check each reservation for overlap with our selected date range
        reservations.forEach((res) => {
          // Skip the current reservation if we're editing
          if (this.isEditing && res.id === this.editingReservationId) {
            return;
          }

          const resStartDate = new Date(res.startDate);
          const resEndDate = new Date(res.endDate);

          // Check if there's an overlap between the reservation and our selected dates
          const overlap = !(
            this.selectedEndDate! < resStartDate ||
            this.selectedStartDate! > resEndDate
          );

          if (overlap) {
            // Mark the spot as unavailable
            const spot = this.parkingSpots.find((s) => s.id === res.spot);
            if (spot) {
              spot.available = false;
            }
          }
        });
      } catch (error) {
        console.error('Error updating available spots:', error);
      }
    }
  }

  selectSpot(spotId: string) {
    const spot = this.parkingSpots.find((s) => s.id === spotId);
    if (spot && spot.available) {
      this.selectedSpot = spotId;
    }
  }

  async bookPlace() {
    if (
      !this.selectedSpot ||
      !this.selectedStartDate ||
      !this.selectedEndDate ||
      !this.selectedVehicleDetails
    ) {
      return;
    }

    try {
      const newReservation: Reservation = {
        id:
          this.isEditing && this.editingReservationId
            ? this.editingReservationId
            : Date.now(),
        startDate: this.selectedStartDate,
        endDate: this.selectedEndDate,
        spot: this.selectedSpot,
        vehicle: this.selectedVehicle,
      };

      if (this.isEditing && this.editingReservationId) {
        await this.dataService.updateReservation(newReservation);
      } else {
        await this.dataService.addReservation(newReservation);
      }

      await this.dataService.clearTemporaryReservationData();

      this.router.navigate(['/reservations']);
    } catch (error) {
      console.error('Error saving reservation:', error);
    }
  }

  goBack() {
    this.router.navigate(['/new-reservation']);
  }
}
