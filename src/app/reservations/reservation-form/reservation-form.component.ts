import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { Vehicle } from '../../shared/models/vehicle.model';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css'],
})
export class ReservationFormComponent implements OnInit {
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  minDate = new Date();
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 2));

  userVehicles: Vehicle[] = [];

  selectedVehicleId: number | null = null;
  isEditing = false;
  editingReservationId: number | null = null;

  constructor(private router: Router, private dataService: DataService) {}

  async ngOnInit() {
    try {
      this.userVehicles = await this.dataService.getUserVehicles();

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

  addNewVehicle() {
    this.router.navigate(['/profile'], { queryParams: { addVehicle: true } });
  }
}
