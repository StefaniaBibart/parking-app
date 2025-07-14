import { Injectable, inject } from '@angular/core';
import { ParkingSpotService } from './parking-spot.service';
import { ConfigService } from './config.service';
import { ParkingSpot } from '../models/parking-spot.model';

@Injectable()
export class LocalStorageParkingSpotService extends ParkingSpotService {
  private settingsLoaded = false;
  private parkingSettingsKey = 'parkingSettings';

  private readonly configService = inject(ConfigService);

  constructor() {
    super();
  }

  private loadSettings(): void {
    const savedSettings = localStorage.getItem(this.parkingSettingsKey);
    if (savedSettings) {
      this.configService.settings = JSON.parse(savedSettings);
    } else {
      this.configService.settings = JSON.parse(
        JSON.stringify(this.configService.defaultSettings)
      );
      this.saveSettings();
    }
    this.settingsLoaded = true;
  }

  private saveSettings(): void {
    localStorage.setItem(
      this.parkingSettingsKey,
      JSON.stringify(this.configService.settings)
    );
  }

  private ensureSettingsLoaded(): void {
    if (!this.settingsLoaded) {
      this.loadSettings();
    }
  }

  async getParkingSpots(): Promise<ParkingSpot[]> {
    this.ensureSettingsLoaded();
    const spots = this.configService.settings.parkingLayout.spots.map(
      (spot: any) => ({
        id: spot.id,
        available: true,
        floor: spot.floor,
        isBlocked: spot.isBlocked || false,
      })
    );
    return Promise.resolve(spots);
  }

  async addParkingSpot(floor: string, spotNumber: number): Promise<void> {
    this.ensureSettingsLoaded();
    const newSpotId = `${floor}${spotNumber}`;
    const existingSpot = this.configService.settings.parkingLayout.spots.find(
      (spot: any) => spot.id === newSpotId
    );

    if (!existingSpot) {
      this.configService.settings.parkingLayout.spots.push({
        id: newSpotId,
        floor: floor,
        isBlocked: false,
      });
      this.saveSettings();
    }
    return Promise.resolve();
  }

  async updateParkingSpot(
    spotId: string,
    spotData: Partial<ParkingSpot>
  ): Promise<void> {
    this.ensureSettingsLoaded();
    const spot = this.configService.settings.parkingLayout.spots.find(
      (s: any) => s.id === spotId
    );

    if (spot) {
      Object.assign(spot, spotData);
      this.saveSettings();
    }

    return Promise.resolve();
  }

  async removeParkingSpot(spotId: string): Promise<void> {
    this.ensureSettingsLoaded();
    const index = this.configService.settings.parkingLayout.spots.findIndex(
      (spot: any) => spot.id === spotId
    );

    if (index > -1) {
      this.configService.settings.parkingLayout.spots.splice(index, 1);
      this.saveSettings();
    }
    return Promise.resolve();
  }

  async clearParkingLayout(): Promise<void> {
    this.ensureSettingsLoaded();
    this.configService.settings.parkingLayout = {
      floors: this.configService.defaultSettings.parkingLayout.floors,
      spots: [],
    };
    this.saveSettings();
    return Promise.resolve();
  }

  async populateDefaultParkingLayout(): Promise<void> {
    this.ensureSettingsLoaded();
    this.configService.settings.parkingLayout = JSON.parse(
      JSON.stringify(this.configService.defaultSettings.parkingLayout)
    );
    this.saveSettings();
    return Promise.resolve();
  }
}
