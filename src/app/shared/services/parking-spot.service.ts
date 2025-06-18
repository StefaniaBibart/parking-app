import { Injectable } from '@angular/core';
import { ParkingSpot } from '../models/parking-spot.model';

@Injectable()
export abstract class ParkingSpotService {
  abstract getParkingSpots(): Promise<ParkingSpot[]>;
  abstract addParkingSpot(floor: string, spotNumber: number): Promise<void>;
  abstract removeParkingSpot(spotId: string): Promise<void>;
  abstract updateParkingSpot(
    spotId: string,
    spotData: Partial<ParkingSpot>
  ): Promise<void>;
  abstract clearParkingLayout(): Promise<void>;
  abstract populateDefaultParkingLayout(): Promise<void>;
}
