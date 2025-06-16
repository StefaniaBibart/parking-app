import { Injectable } from '@angular/core';
import { ParkingSpotService } from './parking-spot.service';
import { ConfigService } from './config.service';
import { ParkingSpot } from '../models/parking-spot.model';

@Injectable()
export class LocalStorageParkingSpotService extends ParkingSpotService {
  constructor(private configService: ConfigService) {
    super();
  }

  async getParkingSpots(): Promise<ParkingSpot[]> {
    const spots = this.configService.settings.parkingLayout.spots.map(
      (spot: any) => ({
        id: spot.id,
        available: true,
        floor: spot.floor,
      })
    );
    return Promise.resolve(spots);
  }

  async addParkingSpot(floor: string, spotNumber: number): Promise<void> {
    const newSpotId = `${floor}${spotNumber}`;
    const existingSpot = this.configService.settings.parkingLayout.spots.find(
      (spot: any) => spot.id === newSpotId
    );

    if (!existingSpot) {
      this.configService.settings.parkingLayout.spots.push({
        id: newSpotId,
        floor: floor,
      });
      this.configService.saveSettings();
    }
    return Promise.resolve();
  }

  async removeParkingSpot(spotId: string): Promise<void> {
    const index = this.configService.settings.parkingLayout.spots.findIndex(
      (spot: any) => spot.id === spotId
    );

    if (index > -1) {
      this.configService.settings.parkingLayout.spots.splice(index, 1);
      this.configService.saveSettings();
    }
    return Promise.resolve();
  }
}
