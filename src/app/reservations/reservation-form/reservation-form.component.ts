import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService, Vehicle } from '../../shared/services/data.service';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent implements OnInit {
  selectedDate: Date | null = null;
  minDate = new Date();
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 2));
  
  userVehicles: Vehicle[] = [];
  
  selectedVehicleId: number | null = null;
  isEditing = false;
  editingReservationId: number | null = null;
  
  constructor(
    private router: Router,
    private dataService: DataService
  ) {}
  
  async ngOnInit() {
    try {
      this.userVehicles = await this.dataService.getUserVehicles();
      
      const tempData = await this.dataService.getTemporaryReservationData();
      
      if (tempData.editingReservationId) {
        this.isEditing = true;
        this.editingReservationId = tempData.editingReservationId;
      }
      
      if (tempData.reservationDate) {
        this.selectedDate = new Date(tempData.reservationDate);
      }
      
      if (tempData.reservationVehicleId) {
        this.selectedVehicleId = tempData.reservationVehicleId;
      }
    } catch (error) {
      console.error('Error initializing reservation form:', error);
    }
  }
  
  onDateSelected(date: Date) {
    this.selectedDate = date;
  }
  
  selectVehicle(vehicleId: number) {
    this.selectedVehicleId = vehicleId;
  }
  
  async proceedToSpotSelection() {
    if (this.selectedDate && this.selectedVehicleId) {
      try {
        await this.dataService.storeTemporaryReservationData({
          reservationDate: this.selectedDate.toISOString(),
          reservationVehicleId: this.selectedVehicleId
        });
        
        if (this.isEditing && this.editingReservationId) {
          await this.dataService.storeTemporaryReservationData({
            editingReservationId: this.editingReservationId
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
