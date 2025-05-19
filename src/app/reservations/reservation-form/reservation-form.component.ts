import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { Vehicle } from '../../shared/models/vehicle.model';
import { ConfigService } from '../../shared/services/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Reservation } from '../../shared/models/reservation.model';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css'],
})
export class ReservationFormComponent implements OnInit {
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null, [Validators.required]),
    end: new FormControl<Date | null>(null, [Validators.required]),
  });

  minDate = new Date();
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 2));

  userVehicles: Vehicle[] = [];
  userReservations: Reservation[] = [];

  selectedVehicleId: number | null = null;
  isEditing = false;
  editingReservationId: number | null = null;

  dateError: string = '';
  availableSpots: string[] = [];
  checkingAvailability: boolean = false;

  constructor(
    private router: Router,
    private dataService: DataService,
    private configService: ConfigService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    try {
      this.userVehicles = await this.dataService.getUserVehicles();
      this.userReservations = await this.dataService.getReservations();

      const tempData = await this.dataService.getTemporaryReservationData();

      if (tempData.editingReservationId) {
        this.isEditing = true;
        this.editingReservationId = tempData.editingReservationId;
      }

      if (tempData.reservationStartDate) {
        this.dateRange
          .get('start')
          ?.setValue(new Date(tempData.reservationStartDate));
      }

      if (tempData.reservationEndDate) {
        this.dateRange
          .get('end')
          ?.setValue(new Date(tempData.reservationEndDate));
      }

      if (tempData.reservationVehicleId) {
        this.selectedVehicleId = tempData.reservationVehicleId;
      }

      this.dateRange.valueChanges.subscribe(async () => {
        const startDate = this.dateRange.get('start')?.value;
        const endDate = this.dateRange.get('end')?.value;

        if (startDate && endDate) {
          const isValid = this.validateDateSelection();

          if (isValid) {
            this.checkingAvailability = true;
            this.availableSpots = await this.checkAvailableSpots(
              startDate,
              endDate
            );
            this.checkingAvailability = false;

            if (this.availableSpots.length === 0) {
              this.dateError =
                'All parking spots are booked for the selected dates. Please choose different dates.';
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing reservation form:', error);
    }
  }

  selectVehicle(vehicleId: number) {
    this.selectedVehicleId = vehicleId;
  }

  async proceedToSpotSelection() {
    const startDate = this.dateRange.get('start')?.value;
    const endDate = this.dateRange.get('end')?.value;

    if (startDate && endDate && this.selectedVehicleId) {
      if (!this.validateDateSelection()) {
        return;
      }

      if (this.availableSpots.length === 0) {
        return;
      }

      try {
        await this.dataService.storeTemporaryReservationData({
          reservationStartDate: startDate.toISOString(),
          reservationEndDate: endDate.toISOString(),
          reservationVehicleId: this.selectedVehicleId,
        });

        if (this.isEditing && this.editingReservationId) {
          await this.dataService.storeTemporaryReservationData({
            editingReservationId: this.editingReservationId,
          });
        }

        this.router.navigate(['/select-spot']);
      } catch (error) {
        console.error('Error storing temporary reservation data:', error);
      }
    }
  }

  async checkAvailableSpots(startDate: Date, endDate: Date): Promise<string[]> {
    try {
      const allSpots = this.configService
        .generateParkingSpots()
        .map((spot) => spot.id);

      const reservations = await this.dataService.getAllReservations();

      const overlappingReservations = reservations.filter((res) => {
        if (this.isEditing && res.id === this.editingReservationId) {
          return false;
        }

        const resStart = new Date(res.startDate);
        const resEnd = new Date(res.endDate);

        return !(endDate < resStart || startDate > resEnd);
      });

      const bookedSpots = overlappingReservations.map((res) => res.spot);

      const availableSpots = allSpots.filter(
        (spot) => !bookedSpots.includes(spot)
      );

      return availableSpots;
    } catch (error) {
      console.error('Error checking available spots:', error);
      return [];
    }
  }

  addNewVehicle() {
    this.router.navigate(['/profile'], { queryParams: { addVehicle: true } });
  }

  validateDateSelection(): boolean {
    this.dateError = '';
    const startDate = this.dateRange.get('start')?.value;
    const endDate = this.dateRange.get('end')?.value;

    if (!startDate || !endDate) {
      return false;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
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
      this.dateError =
        'You already have a reservation during this period. Please select different dates.';
      return false;
    }

    if (!this.configService.allowOverlappingReservations) {
      this.checkForOverlappingReservations(start, end);
    }

    return this.dateError === '';
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
        this.dateError =
          'These dates are already booked. Please select different dates.';
      }
    } catch (error) {
      console.error('Error checking for overlapping reservations:', error);
    }
  }
}
