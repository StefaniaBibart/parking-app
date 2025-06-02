import { Injectable } from '@angular/core';
import { ParkingSpot } from '../models/parking-spot.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private defaultSettings = {
    allowOverlappingReservations: true,
    maxReservationsPerDay: 1,
    parkingLayout: {
      floors: ['A', 'B', 'C', 'D'],
      spots: [
        { id: 'A1', floor: 'A' },
        { id: 'A2', floor: 'A' },
        { id: 'A3', floor: 'A' },
        { id: 'A4', floor: 'A' },
        { id: 'A5', floor: 'A' },
        { id: 'B7', floor: 'B' },
        { id: 'B8', floor: 'B' },
        { id: 'B9', floor: 'B' },
        { id: 'B10', floor: 'B' },
        { id: 'B11', floor: 'B' },
        { id: 'C1', floor: 'C' },
        { id: 'C2', floor: 'C' },
        { id: 'C3', floor: 'C' },
        { id: 'C4', floor: 'C' },
        { id: 'C5', floor: 'C' },
        { id: 'D6', floor: 'D' },
        { id: 'D7', floor: 'D' },
        { id: 'D8', floor: 'D' },
        { id: 'D9', floor: 'D' },
        { id: 'D10', floor: 'D' },
      ],
    },
  };

  private settings: any;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const savedSettings = localStorage.getItem('parkingSettings');
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
    } else {
      this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
      this.saveSettings();
    }
  }

  private saveSettings() {
    localStorage.setItem('parkingSettings', JSON.stringify(this.settings));
  }

  get parkingLayout() {
    return this.settings.parkingLayout;
  }

  get allowOverlappingReservations() {
    return this.settings.allowOverlappingReservations;
  }

  get maxReservationsPerDay() {
    return this.settings.maxReservationsPerDay;
  }

  generateParkingSpots(): ParkingSpot[] {
    return this.settings.parkingLayout.spots.map((spot: any) => ({
      id: spot.id,
      available: true,
      floor: spot.floor,
    }));
  }

  addParkingSpot(floor: string, spotNumber: number): void {
    const newSpotId = `${floor}${spotNumber}`;

    const existingSpot = this.settings.parkingLayout.spots.find(
      (spot: any) => spot.id === newSpotId
    );

    if (!existingSpot) {
      this.settings.parkingLayout.spots.push({
        id: newSpotId,
        floor: floor,
      });
      this.saveSettings();
    }
  }

  removeParkingSpot(spotId: string): void {
    const index = this.settings.parkingLayout.spots.findIndex(
      (spot: any) => spot.id === spotId
    );

    if (index > -1) {
      this.settings.parkingLayout.spots.splice(index, 1);
      this.saveSettings();
    }
  }

  resetToDefaults(): void {
    this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
    this.saveSettings();
  }
}
