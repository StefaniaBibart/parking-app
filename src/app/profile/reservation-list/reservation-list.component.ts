import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.css']
})
export class ReservationListComponent {
  activeTab = 'upcoming';
  
  upcomingReservations = [
    { 
      id: 1, 
      date: new Date('2023-08-15'), 
      time: '11:00', 
      spot: 'B8', 
      vehicle: 'ABC-123',
      vehicleType: 'Sedan',
      price: 38.00
    },
    { 
      id: 2, 
      date: new Date('2023-08-20'), 
      time: '09:00', 
      spot: 'A4', 
      vehicle: 'XYZ-789',
      vehicleType: 'SUV',
      price: 42.00
    }
  ];
  
  pastReservations = [
    { 
      id: 3, 
      date: new Date('2023-07-25'), 
      time: '14:00', 
      spot: 'B9', 
      vehicle: 'ABC-123',
      vehicleType: 'Sedan',
      price: 38.00
    },
    { 
      id: 4, 
      date: new Date('2023-07-10'), 
      time: '10:00', 
      spot: 'A5', 
      vehicle: 'XYZ-789',
      vehicleType: 'SUV',
      price: 42.00
    }
  ];
  
  constructor(private router: Router) {}
  
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  
  cancelReservation(id: number) {
    this.upcomingReservations = this.upcomingReservations.filter(res => res.id !== id);
  }
  
  createNewReservation() {
    this.router.navigate(['/new-reservation']);
  }
}
