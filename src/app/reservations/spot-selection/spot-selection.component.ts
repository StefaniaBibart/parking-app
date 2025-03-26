import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-spot-selection',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './spot-selection.component.html',
  styleUrls: ['./spot-selection.component.css']
})
export class SpotSelectionComponent implements OnInit {
  selectedVehicle: string = '';
  selectedVehicleDetails: any = null;
  selectedSpot: string = '';
  totalPrice: number = 38.00;
  selectedDate: Date | null = null;
  
  userVehicles = [
    { id: 1, plate: 'ABC-123', type: 'Sedan', color: 'Blue' },
    { id: 2, plate: 'XYZ-789', type: 'SUV', color: 'Black' }
  ];
  
  parkingSpots = [
    { id: 'A1', available: true },
    { id: 'A2', available: false },
    { id: 'A3', available: false },
    { id: 'A4', available: true },
    { id: 'A5', available: true },
    { id: 'B7', available: false },
    { id: 'B8', available: true },
    { id: 'B9', available: true },
    { id: 'B10', available: true },
    { id: 'B11', available: true }
  ];
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    const dateStr = localStorage.getItem('reservationDate');
    const vehicleId = localStorage.getItem('reservationVehicleId');
    
    if (dateStr) {
      this.selectedDate = new Date(dateStr);
    }
    
    if (vehicleId) {
      const vehicle = this.userVehicles.find(v => v.id === parseInt(vehicleId));
      if (vehicle) {
        this.selectedVehicle = vehicle.plate;
        this.selectedVehicleDetails = vehicle;
      }
    }
    
    if (!this.selectedDate || !this.selectedVehicle) {
      this.router.navigate(['/new-reservation']);
    }
  }
  
  selectSpot(spotId: string) {
    const spot = this.parkingSpots.find(s => s.id === spotId);
    if (spot && spot.available) {
      this.selectedSpot = spotId;
    }
  }
  
  bookPlace() {
    if (!this.selectedSpot) {
      return;
    }
    
    console.log('Booking place:', {
      date: this.selectedDate,
      vehicle: this.selectedVehicle,
      spot: this.selectedSpot,
      price: this.totalPrice
    });
    
    localStorage.removeItem('reservationDate');
    localStorage.removeItem('reservationVehicleId');
    
    this.router.navigate(['/reservations']);
  }
  
  goBack() {
    this.router.navigate(['/new-reservation']);
  }
}
