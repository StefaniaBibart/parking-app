import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Reservation {
  id: number;
  date: Date;
  spot: string;
  vehicle: string;
  vehicleType: string;
}

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.css']
})
export class ReservationListComponent implements OnInit {
  activeTab = 'upcoming';
  
  upcomingReservations: Reservation[] = [];
  pastReservations: Reservation[] = [];
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.loadReservations();
  }
  
  loadReservations() {
    const storedReservations = localStorage.getItem('userReservations');
    
    if (storedReservations) {
      const reservations: Reservation[] = JSON.parse(storedReservations);
      
      reservations.forEach(res => {
        res.date = new Date(res.date);
      });
      
      const now = new Date();
      
      this.upcomingReservations = reservations.filter(res => new Date(res.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      this.pastReservations = reservations.filter(res => new Date(res.date) < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }
  
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  
  cancelReservation(id: number) {
    this.upcomingReservations = this.upcomingReservations.filter(res => res.id !== id);
    
    const allReservations = [...this.upcomingReservations, ...this.pastReservations];
    localStorage.setItem('userReservations', JSON.stringify(allReservations));
  }
  
  editReservation(reservation: Reservation) {
    localStorage.setItem('editingReservationId', reservation.id.toString());
    
    localStorage.setItem('reservationDate', reservation.date.toISOString());
    
    let vehicleFound = false;
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      if (parsedData.cars && Array.isArray(parsedData.cars)) {
        const vehicle = parsedData.cars.find((car: any) => car.plate === reservation.vehicle);
        if (vehicle) {
          localStorage.setItem('reservationVehicleId', vehicle.id.toString());
          vehicleFound = true;
        }
      }
    }
    
    if (!vehicleFound) {
      console.warn('Vehicle not found in user profile:', reservation.vehicle);
    }
    
    this.router.navigate(['/new-reservation']);
  }
  
  createNewReservation() {
    localStorage.removeItem('editingReservationId');
    localStorage.removeItem('reservationDate');
    localStorage.removeItem('reservationVehicleId');
    
    this.router.navigate(['/new-reservation']);
  }
}
