import { Injectable } from '@angular/core';
import { ParkingSpot } from '../models/parking-spot.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private settings = {
    allowOverlappingReservations: true,
    maxReservationsPerDay: 1,
    parkingLayout: {
      floors: ['A', 'B', 'C', 'D'],
      spotsPerFloor: {
        A: 5,
        B: 5,
        C: 5,
        D: 5,
      },
      startingNumbers: {
        A: 1,
        B: 7,
        C: 1,
        D: 6,
      },
    },
  };

  constructor() {}

  get allowOverlappingReservations(): boolean {
    return this.settings.allowOverlappingReservations;
  }

  get maxReservationsPerDay(): number {
    return this.settings.maxReservationsPerDay;
  }

  get parkingLayout() {
    return this.settings.parkingLayout;
  }

  updateSettings(newSettings: Partial<typeof this.settings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  generateParkingSpots(): ParkingSpot[] {
    const spots: ParkingSpot[] = [];
    const { floors, spotsPerFloor, startingNumbers } =
      this.settings.parkingLayout;

    floors.forEach((floor) => {
      const numSpots = spotsPerFloor[floor as keyof typeof spotsPerFloor];
      const startingNumber =
        startingNumbers[floor as keyof typeof startingNumbers];

      for (let i = 0; i < numSpots; i++) {
        const spotNumber = startingNumber + i;
        spots.push({
          id: `${floor}${spotNumber}`,
          available: true,
          floor: floor,
        });
      }
    });

    return spots;
  }
}
