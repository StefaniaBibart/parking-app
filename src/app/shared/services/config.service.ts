import { Injectable } from '@angular/core';

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

  public settings: any;

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

  public saveSettings() {
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

  resetToDefaults(): void {
    this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
    this.saveSettings();
  }
}
