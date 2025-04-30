import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Reservation {
  id: number;
  date: Date;
  spot: string;
  vehicle: string;
  vehicleType: string;
}

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
  selectedDate: Date | null = null;
  isEditing = false;
  editingReservationId: number | null = null;
  
  userVehicles: any[] = [];
  
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
    { id: 'B11', available: true }
  ];
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    const dateStr = localStorage.getItem('reservationDate');
    const vehicleId = localStorage.getItem('reservationVehicleId');
    const editingId = localStorage.getItem('editingReservationId');
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      if (parsedData.cars && Array.isArray(parsedData.cars)) {
        this.userVehicles = parsedData.cars;
      }
    }
    
    if (editingId) {
      this.isEditing = true;
      this.editingReservationId = parseInt(editingId);
      
      const storedReservations = localStorage.getItem('userReservations');
      if (storedReservations) {
        const reservations: Reservation[] = JSON.parse(storedReservations);
        const editingReservation = reservations.find(r => r.id === this.editingReservationId);
        
        if (editingReservation) {
          this.selectedSpot = editingReservation.spot;
          
          if (!vehicleId && editingReservation.vehicle) {
            const vehicle = this.userVehicles.find(v => v.plate === editingReservation.vehicle);
            if (vehicle) {
              localStorage.setItem('reservationVehicleId', vehicle.id.toString());
            }
          }
        }
      }
    }
    
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
    
    this.updateAvailableSpots();
  }
  
  updateAvailableSpots() {
    const storedReservations = localStorage.getItem('userReservations');
    if (storedReservations && this.selectedDate) {
      const reservations: Reservation[] = JSON.parse(storedReservations);
      
      reservations.forEach(res => {
        if (typeof res.date === 'string') {
          res.date = new Date(res.date);
        }
      });
      
      const selectedDateStr = this.selectedDate.toDateString();
      const reservationsOnSelectedDate = reservations.filter(res => {
        if (this.isEditing && res.id === this.editingReservationId) {
          return false;
        }
        return new Date(res.date).toDateString() === selectedDateStr;
      });
      
      this.parkingSpots.forEach(spot => {
        spot.available = !reservationsOnSelectedDate.some(res => res.spot === spot.id);
      });
    }
  }
  
  selectSpot(spotId: string) {
    const spot = this.parkingSpots.find(s => s.id === spotId);
    if (spot && spot.available) {
      this.selectedSpot = spotId;
    }
  }
  
  bookPlace() {
    if (!this.selectedSpot || !this.selectedDate) {
      return;
    }
    
    const newReservation: Reservation = {
      id: this.isEditing && this.editingReservationId ? this.editingReservationId : Date.now(),
      date: this.selectedDate,
      spot: this.selectedSpot,
      vehicle: this.selectedVehicle,
      vehicleType: this.selectedVehicleDetails?.type || 'Unknown'
    };
    
    const existingReservationsStr = localStorage.getItem('userReservations');
    let existingReservations: Reservation[] = existingReservationsStr 
      ? JSON.parse(existingReservationsStr) 
      : [];
    
    if (this.isEditing && this.editingReservationId) {
      existingReservations = existingReservations.filter(res => res.id !== this.editingReservationId);
    }
    
    existingReservations.push(newReservation);
    localStorage.setItem('userReservations', JSON.stringify(existingReservations));
    
    localStorage.removeItem('reservationDate');
    localStorage.removeItem('reservationVehicleId');
    localStorage.removeItem('editingReservationId');
    
    this.router.navigate(['/reservations']);
  }
  
  goBack() {
    this.router.navigate(['/new-reservation']);
  }
}
