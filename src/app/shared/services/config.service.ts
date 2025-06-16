import { Injectable } from '@angular/core';
import { ParkingSpot } from '../models/parking-spot.model';

function generateSpotsForFloor(
  floor: string,
  count: number,
  start = 1
): { id: string; floor: string }[] {
  const spots = [];
  for (let i = 0; i < count; i++) {
    spots.push({
      id: `${floor}${start + i}`,
      floor: floor,
    });
  }
  return spots;
}

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
        ...generateSpotsForFloor('A', 5, 1),
        ...generateSpotsForFloor('B', 5, 7),
        ...generateSpotsForFloor('C', 5, 1),
        ...generateSpotsForFloor('D', 5, 6),
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
