import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private settings = {
    allowOverlappingReservations: true,
    maxReservationsPerDay: 1,
  };

  constructor() {}

  get allowOverlappingReservations(): boolean {
    return this.settings.allowOverlappingReservations;
  }

  get maxReservationsPerDay(): number {
    return this.settings.maxReservationsPerDay;
  }

  updateSettings(newSettings: Partial<typeof this.settings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }
}
