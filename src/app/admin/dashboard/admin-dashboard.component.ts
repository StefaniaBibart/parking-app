import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { DataService } from '../../shared/services/data.service';
import { ConfigService } from '../../shared/services/config.service';
import { Reservation } from '../../shared/models/reservation.model';
import { ParkingSpot } from '../../shared/models/parking-spot.model';
import { ParkingSpotService } from '../../shared/services/parking-spot.service';

@Component({
    selector: 'app-admin-dashboard',
    imports: [CommonModule, MaterialModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  totalSpots: number = 0;
  availableSpots: number = 0;
  occupiedSpots: number = 0;
  totalReservations: number = 0;
  upcomingReservations: number = 0;
  pastReservations: number = 0;
  todayReservations: number = 0;
  currentDate: Date = new Date();

  spotsByFloor: {
    floor: string;
    total: number;
    available: number;
    occupied: number;
  }[] = [];

  constructor(
    private dataService: DataService,
    private configService: ConfigService,
    private parkingSpotService: ParkingSpotService
  ) {}

  async ngOnInit() {
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      const allSpots = await this.parkingSpotService.getParkingSpots();
      this.totalSpots = allSpots.length;

      const allReservations = await this.dataService.getAllReservations();
      this.totalReservations = allReservations.length;

      const now = new Date();
      this.currentDate = now;

      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const todayReservations = allReservations.filter((res) => {
        const startDate = new Date(res.startDate);
        const endDate = new Date(res.endDate);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return startDate <= today && endDate >= today;
      });

      this.todayReservations = todayReservations.length;

      const upcomingReservations = allReservations.filter((res) => {
        const startDate = new Date(res.startDate);
        startDate.setHours(0, 0, 0, 0);
        return startDate > today;
      });

      const pastReservations = allReservations.filter((res) => {
        const endDate = new Date(res.endDate);
        endDate.setHours(23, 59, 59, 999);
        return endDate < today;
      });

      this.upcomingReservations = upcomingReservations.length;
      this.pastReservations = pastReservations.length;

      this.occupiedSpots = todayReservations.length;
      this.availableSpots = this.totalSpots - this.occupiedSpots;

      this.calculateSpotsByFloor(allSpots, todayReservations);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  calculateSpotsByFloor(
    allSpots: ParkingSpot[],
    activeReservations: Reservation[]
  ) {
    const floors: string[] = this.configService.parkingLayout.floors;

    this.spotsByFloor = floors.map((floor: string) => {
      const floorSpots = allSpots.filter((spot) => spot.floor === floor);
      const occupiedFloorSpots = activeReservations.filter((res) =>
        res.spot.startsWith(floor)
      ).length;

      return {
        floor,
        total: floorSpots.length,
        occupied: occupiedFloorSpots,
        available: floorSpots.length - occupiedFloorSpots,
      };
    });
  }
}
