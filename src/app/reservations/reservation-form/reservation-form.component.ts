import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  
  userVehicles: any[] = [];
  
  selectedVehicleId: number | null = null;
  isEditing = false;
  editingReservationId: number | null = null;
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      if (parsedData.cars && Array.isArray(parsedData.cars)) {
        this.userVehicles = parsedData.cars;
      }
    }
    
    const editingId = localStorage.getItem('editingReservationId');
    if (editingId) {
      this.isEditing = true;
      this.editingReservationId = parseInt(editingId);
    }
    
    const dateStr = localStorage.getItem('reservationDate');
    if (dateStr) {
      this.selectedDate = new Date(dateStr);
    }
    
    const vehicleId = localStorage.getItem('reservationVehicleId');
    if (vehicleId) {
      this.selectedVehicleId = parseInt(vehicleId);
    }
  }
  
  onDateSelected(date: Date) {
    this.selectedDate = date;
  }
  
  selectVehicle(vehicleId: number) {
    this.selectedVehicleId = vehicleId;
  }
  
  proceedToSpotSelection() {
    if (this.selectedDate && this.selectedVehicleId) {
      localStorage.setItem('reservationDate', this.selectedDate.toISOString());
      localStorage.setItem('reservationVehicleId', this.selectedVehicleId.toString());
      
      if (this.isEditing && this.editingReservationId) {
        localStorage.setItem('editingReservationId', this.editingReservationId.toString());
      }
      
      this.router.navigate(['/select-spot']);
    }
  }
  
  addNewVehicle() {
    this.router.navigate(['/profile'], { queryParams: { addVehicle: true } });
  }
}
