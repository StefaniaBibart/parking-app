import { Component } from '@angular/core';
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
export class ReservationFormComponent {
  selectedDate: Date | null = null;
  minDate = new Date();
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 2));
  
  userVehicles = [
    { id: 1, plate: 'ABC-123', type: 'Sedan', color: 'Blue' },
    { id: 2, plate: 'XYZ-789', type: 'SUV', color: 'Black' }
  ];
  
  selectedVehicleId: number | null = null;
  
  constructor(private router: Router) {}
  
  onDateSelected(date: Date) {
    console.log('Date selected event triggered');
    console.log('Selected date:', date);
    this.selectedDate = date;
  }
  
  selectVehicle(vehicleId: number) {
    this.selectedVehicleId = vehicleId;
  }
  
  proceedToSpotSelection() {
    console.log('Proceeding to spot selection');
    console.log('Selected date:', this.selectedDate);
    console.log('Selected vehicle ID:', this.selectedVehicleId);
    
    if (this.selectedDate && this.selectedVehicleId) {
      localStorage.setItem('reservationDate', this.selectedDate.toISOString());
      localStorage.setItem('reservationVehicleId', this.selectedVehicleId.toString());
      
      this.router.navigate(['/select-spot']);
    } else {
      console.error('Cannot proceed: missing date or vehicle');
    }
  }
  
  addNewVehicle() {
    this.router.navigate(['/profile'], { queryParams: { addVehicle: true } });
  }
}
