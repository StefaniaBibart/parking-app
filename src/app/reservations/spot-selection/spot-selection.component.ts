import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { Reservation } from '../../shared/models/reservation.model';
import { Vehicle } from '../../shared/models/vehicle.model';
import { ConfigService } from '../../shared/services/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParkingSpot } from '../../shared/models/parking-spot.model';
import { ParkingSpotService } from '../../shared/services/parking-spot.service';

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
  userReservations: Reservation[] = [];

  errorMessage: string = '';

  parkingSpots: ParkingSpot[] = [];

  currentFloorIndex = 0;
  visibleFloors: string[] = ['A', 'B'];

  constructor(
    private router: Router,
    private dataService: DataService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private parkingSpotService: ParkingSpotService
  ) {}

  async ngOnInit() {
    try {
      this.parkingSpots = await this.parkingSpotService.getParkingSpots();
      this.updateVisibleFloors();

      this.userVehicles = await this.dataService.getUserVehicles();
      this.userReservations = await this.dataService.getReservations();

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

      if (!(await this.validateDateSelection())) {
        this.snackBar.open(this.errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
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

        this.parkingSpots.forEach((spot) => (spot.available = true));

        reservations.forEach((res) => {
          if (this.isEditing && res.id === this.editingReservationId) {
            return;
          }

          const resStartDate = new Date(res.startDate);
          const resEndDate = new Date(res.endDate);

          const overlap = !(
            this.selectedEndDate! < resStartDate ||
            this.selectedStartDate! > resEndDate
          );

          if (overlap) {
            const spot = this.parkingSpots.find((s) => s.id === res.spot);
            if (spot) {
              spot.available = false;
            }
          }
        });

        const allSpotsBooked = this.parkingSpots.every(
          (spot) => !spot.available
        );

        if (allSpotsBooked) {
          this.errorMessage =
            'All parking spots are booked for the selected dates. Please choose different dates.';

          // Optional: Navigate back to the reservation form
          // setTimeout(() => {
          //   this.router.navigate(['/new-reservation']);
          // }, 1000);
        }
      } catch (error) {
        console.error('Error updating available spots:', error);
      }
    }
  }

  selectSpot(spot: ParkingSpot) {
    if (spot && spot.available && !spot.isBlocked) {
      this.selectedSpot = spot.id;
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

    if (!(await this.validateDateSelection())) {
      this.snackBar.open(this.errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
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

  async validateDateSelection(): Promise<boolean> {
    this.errorMessage = '';

    if (!this.selectedStartDate || !this.selectedEndDate) {
      this.errorMessage = 'Invalid date selection';
      return false;
    }

    const start = new Date(this.selectedStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.selectedEndDate);
    end.setHours(23, 59, 59, 999);

    const existingReservations = this.userReservations.filter((res) => {
      if (this.isEditing && res.id === this.editingReservationId) {
        return false;
      }

      const resStart = new Date(res.startDate);
      resStart.setHours(0, 0, 0, 0);

      const resEnd = new Date(res.endDate);
      resEnd.setHours(23, 59, 59, 999);

      return !(end < resStart || start > resEnd);
    });

    if (existingReservations.length > 0) {
      this.errorMessage =
        'You already have a reservation during this period. Please select different dates.';
      return false;
    }

    if (!this.configService.allowOverlappingReservations) {
      await this.checkForOverlappingReservations(start, end);
    }

    return this.errorMessage === '';
  }

  async checkForOverlappingReservations(start: Date, end: Date): Promise<void> {
    try {
      const allReservations = await this.dataService.getAllReservations();

      const overlappingReservations = allReservations.filter((res) => {
        if (this.isEditing && res.id === this.editingReservationId) {
          return false;
        }

        const resStart = new Date(res.startDate);
        const resEnd = new Date(res.endDate);

        return !(end < resStart || start > resEnd);
      });

      if (overlappingReservations.length > 0) {
        this.errorMessage =
          'These dates are already booked. Please select different dates.';
      }
    } catch (error) {
      console.error('Error checking for overlapping reservations:', error);
    }
  }

  getFloorSpots(floor: string): ParkingSpot[] {
    return this.parkingSpots.filter((spot) => spot.floor === floor);
  }

  nextFloor() {
    if (
      this.currentFloorIndex <
      this.configService.parkingLayout.floors.length - 2
    ) {
      this.currentFloorIndex += 2;
      this.updateVisibleFloors();
    }
  }

  previousFloor() {
    if (this.currentFloorIndex > 0) {
      this.currentFloorIndex -= 2;
      this.updateVisibleFloors();
    }
  }

  updateVisibleFloors() {
    const allFloors = this.configService.parkingLayout.floors;
    this.visibleFloors = [
      allFloors[this.currentFloorIndex],
      allFloors[this.currentFloorIndex + 1],
    ];
  }

  getMaxFloorIndex(): number {
    return this.configService.parkingLayout.floors.length - 2;
  }
}
