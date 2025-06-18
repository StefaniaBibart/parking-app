import { Injectable } from '@angular/core';
import { getDatabase, ref, get, set } from 'firebase/database';
import { ParkingSpotService } from './parking-spot.service';
import { ParkingSpot } from '../models/parking-spot.model';
import { ConfigService } from './config.service';

@Injectable()
export class FirebaseParkingSpotService extends ParkingSpotService {
  private settingsPath = 'parkingSettings';
  private settingsLoaded = false;

  constructor(private configService: ConfigService) {
    super();
  }

  private async loadSettings(): Promise<void> {
    try {
      const db = getDatabase();
      const settingsRef = ref(db, this.settingsPath);
      const snapshot = await get(settingsRef);
      if (snapshot.exists()) {
        this.configService.settings = snapshot.val();

        // Guard against missing parkingLayout or its properties from Firebase
        if (!this.configService.settings.parkingLayout) {
          this.configService.settings.parkingLayout = JSON.parse(
            JSON.stringify(this.configService.defaultSettings.parkingLayout)
          );
        }
        if (!this.configService.settings.parkingLayout.spots) {
          this.configService.settings.parkingLayout.spots = [];
        }
        if (!this.configService.settings.parkingLayout.floors) {
          this.configService.settings.parkingLayout.floors = JSON.parse(
            JSON.stringify(
              this.configService.defaultSettings.parkingLayout.floors
            )
          );
        }
      } else {
        // If no settings in Firebase, use defaults from ConfigService and save them
        this.configService.settings = JSON.parse(
          JSON.stringify(this.configService.defaultSettings)
        );
        await this.saveSettings();
      }
    } catch (error) {
      console.error('Error loading settings from Firebase:', error);
      this.configService.settings = JSON.parse(
        JSON.stringify(this.configService.defaultSettings)
      );
    } finally {
      this.settingsLoaded = true;
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      const db = getDatabase();
      const settingsRef = ref(db, this.settingsPath);
      await set(settingsRef, this.configService.settings);
    } catch (error) {
      console.error('Error saving settings to Firebase:', error);
      throw error;
    }
  }

  private async ensureSettingsLoaded(): Promise<void> {
    if (!this.settingsLoaded) {
      await this.loadSettings();
    }
  }

  async getParkingSpots(): Promise<ParkingSpot[]> {
    await this.ensureSettingsLoaded();
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
    await this.ensureSettingsLoaded();
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
      await this.saveSettings();
    }
  }

  async updateParkingSpot(
    spotId: string,
    spotData: Partial<ParkingSpot>
  ): Promise<void> {
    await this.ensureSettingsLoaded();
    const spot = this.configService.settings.parkingLayout.spots.find(
      (s: any) => s.id === spotId
    );

    if (spot) {
      Object.assign(spot, spotData);
      await this.saveSettings();
    }
  }

  async removeParkingSpot(spotId: string): Promise<void> {
    await this.ensureSettingsLoaded();
    const index = this.configService.settings.parkingLayout.spots.findIndex(
      (spot: any) => spot.id === spotId
    );

    if (index > -1) {
      this.configService.settings.parkingLayout.spots.splice(index, 1);
      await this.saveSettings();
    }
  }

  async clearParkingLayout(): Promise<void> {
    await this.ensureSettingsLoaded();
    this.configService.settings.parkingLayout = {
      floors: this.configService.defaultSettings.parkingLayout.floors,
      spots: [],
    };
    await this.saveSettings();
  }

  async populateDefaultParkingLayout(): Promise<void> {
    await this.ensureSettingsLoaded();
    this.configService.settings.parkingLayout = JSON.parse(
      JSON.stringify(this.configService.defaultSettings.parkingLayout)
    );
    await this.saveSettings();
  }
}
