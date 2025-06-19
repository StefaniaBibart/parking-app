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
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { Vehicle } from '../../shared/models/vehicle.model';
import { ConfigService } from '../../shared/services/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Reservation } from '../../shared/models/reservation.model';
import { ParkingSpotService } from '../../shared/services/parking-spot.service';
import { ParkingSpot } from '../../shared/models/parking-spot.model';

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
  editingReservation: Reservation | null | undefined = null;

  dateError: string = '';
  availableSpots: string[] = [];
  checkingAvailability: boolean = false;

  formStep: 'date' | 'vehicle' | 'spot' = 'date';

  // Properties from SpotSelectionComponent
  selectedSpot: string = '';
  parkingSpots: ParkingSpot[] = [];
  currentFloorIndex = 0;
  visibleFloors: string[] = ['A', 'B'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private parkingSpotService: ParkingSpotService
  ) {}

  async ngOnInit() {
    try {
      await this.dataService.clearTemporaryReservationData();

      this.userVehicles = await this.dataService.getUserVehicles();
      this.userReservations = await this.dataService.getReservations();
      this.parkingSpots = await this.parkingSpotService.getParkingSpots();
      this.updateVisibleFloors();

      const reservationId = this.route.snapshot.paramMap.get('id');
      if (reservationId) {
        this.isEditing = true;
        this.editingReservationId = +reservationId;
        this.editingReservation = await this.dataService.getReservationById(
          this.editingReservationId
        );
        if (this.editingReservation) {
          if (this.editingReservation.userId) {
            this.userVehicles = await this.dataService.getUserVehiclesByUserId(
              this.editingReservation.userId
            );
          } else {
            this.userVehicles = await this.dataService.getUserVehicles();
          }
          this.dateRange.patchValue({
            start: new Date(this.editingReservation.startDate),
            end: new Date(this.editingReservation.endDate),
          });

          const vehicle = this.userVehicles.find(
            (v) => v.plate === this.editingReservation?.vehicle
          );
          if (vehicle) {
            this.selectedVehicleId = vehicle.id;
          }

          this.selectedSpot = this.editingReservation.spot;
          this.formStep = 'spot';
        }
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
            } else {
              await this.updateAvailableSpots();
              if (!this.dateError) {
                if (this.selectedVehicleId) {
                  this.formStep = 'spot';
                  if (
                    this.selectedSpot &&
                    !this.availableSpots.includes(this.selectedSpot)
                  ) {
                    this.selectedSpot = '';
                    this.snackBar.open(
                      'Your previously selected spot is not available for the new dates. Please select a new spot.',
                      'Close',
                      { duration: 5000 }
                    );
                  }
                } else {
                  this.formStep = 'vehicle';
                }
              }
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
    this.formStep = 'spot';
  }

  editDate() {
    this.formStep = 'date';
    this.dateError = '';
    this.dateRange.reset();
  }

  editVehicle() {
    this.formStep = 'vehicle';
  }

  async bookPlace() {
    const startDate = this.dateRange.get('start')?.value;
    const endDate = this.dateRange.get('end')?.value;

    if (
      !this.selectedSpot ||
      !startDate ||
      !endDate ||
      !this.selectedVehicleId
    ) {
      return;
    }

    if (!this.validateDateSelection()) {
      this.snackBar.open('Invalid data for reservation', 'Close', {
        duration: 3000,
      });
      return;
    }

    try {
      const selectedVehicle = this.userVehicles.find(
        (v) => v.id === this.selectedVehicleId
      );
      if (!selectedVehicle) {
        this.snackBar.open('Selected vehicle not found.', 'Close', {
          duration: 3000,
        });
        return;
      }

      const newReservation: Reservation = {
        id:
          this.isEditing && this.editingReservationId
            ? this.editingReservationId
            : Date.now(),
        startDate: startDate,
        endDate: endDate,
        spot: this.selectedSpot,
        vehicle: selectedVehicle.plate,
        userId: this.editingReservation?.userId,
      };

      if (this.isEditing && this.editingReservationId) {
        await this.dataService.updateReservation(newReservation);
      } else {
        await this.dataService.addReservation(newReservation);
      }

      await this.dataService.clearTemporaryReservationData();

      if (this.router.url.includes('admin')) {
        this.router.navigate(['/admin/reservations']);
      } else {
        this.router.navigate(['/reservations']);
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
    }
  }

  async updateAvailableSpots() {
    const startDate = this.dateRange.get('start')?.value;
    const endDate = this.dateRange.get('end')?.value;

    if (startDate && endDate) {
      try {
        const reservations = await this.dataService.getAllReservations();

        this.parkingSpots.forEach((spot) => (spot.available = true));

        reservations.forEach((res) => {
          if (this.isEditing && res.id === this.editingReservationId) {
            return;
          }

          const resStartDate = new Date(res.startDate);
          const resEndDate = new Date(res.endDate);

          const overlap = !(endDate < resStartDate || startDate > resEndDate);

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
          this.dateError =
            'All parking spots are booked for the selected dates. Please choose different dates.';
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

  async checkAvailableSpots(startDate: Date, endDate: Date): Promise<string[]> {
    try {
      const allParkingSpots = await this.parkingSpotService.getParkingSpots();
      const allSpots = allParkingSpots.map((spot: ParkingSpot) => spot.id);

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
        (spot: string) => !bookedSpots.includes(spot)
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

  getSelectedVehiclePlate(): string {
    if (!this.selectedVehicleId) {
      return '';
    }
    const vehicle = this.userVehicles.find(
      (v) => v.id === this.selectedVehicleId
    );
    return vehicle ? vehicle.plate : '';
  }

  // --- Floor navigation methods from SpotSelectionComponent ---
  getFloorSpots(floor: string): ParkingSpot[] {
    return this.parkingSpots.filter((spot) => spot.id.startsWith(floor));
  }

  nextFloor() {
    const maxIndex = this.getMaxFloorIndex();
    if (this.currentFloorIndex < maxIndex) {
      this.currentFloorIndex++;
      this.updateVisibleFloors();
    }
  }

  previousFloor() {
    if (this.currentFloorIndex > 0) {
      this.currentFloorIndex--;
      this.updateVisibleFloors();
    }
  }

  updateVisibleFloors() {
    const floors = ['A', 'B', 'C', 'D'];
    this.visibleFloors = floors.slice(
      this.currentFloorIndex * 2,
      this.currentFloorIndex * 2 + 2
    );
  }

  getMaxFloorIndex(): number {
    const floors = ['A', 'B', 'C', 'D'];
    return Math.ceil(floors.length / 2) - 1;
  }
}
