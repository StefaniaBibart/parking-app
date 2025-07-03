import { Injectable, effect, inject, signal } from '@angular/core';
import { DataService } from './data.service';
import { User } from '../models/user.model';
import { Vehicle } from '../models/vehicle.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly authService = inject(AuthService);
  private readonly dataService = inject(DataService);

  private readonly userSignal = signal<User | null>(null);

  constructor() {
    effect(async () => {
      const user = await this.authService.user();
      this.userSignal.set(user);
    });
  }

  getCurrentUser(): User | null {
    return this.userSignal();
  }

  getCurrentUserId(): string {
    const user = this.getCurrentUser();
    return user?.id || 'anonymous';
  }

  async saveUserData(user: User): Promise<void> {
    try {
      await this.dataService.updateUser(user);
      this.userSignal.set(user);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  async addVehicle(vehicle: Vehicle): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const cars = user.cars || [];
      cars.push(vehicle);

      const updatedUser = {
        ...user,
        cars,
      };

      await this.saveUserData(updatedUser);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  }

  async updateVehicle(vehicle: Vehicle): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No user logged in');
      if (!user.cars) throw new Error('User has no vehicles');

      const index = user.cars.findIndex((v) => v.id === vehicle.id);
      if (index === -1)
        throw new Error(`Vehicle with id ${vehicle.id} not found`);

      user.cars[index] = vehicle;

      await this.saveUserData(user);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  async deleteVehicle(id: number): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No user logged in');
      if (!user.cars) throw new Error('User has no vehicles');

      // Get the vehicle to be deleted
      const vehicleToDelete = user.cars.find((v) => v.id === id);

      if (!vehicleToDelete) {
        throw new Error(`Vehicle with id ${id} not found`);
      }

      // Use the data service to delete associated reservations
      // This assumes you have access to the dataService
      const reservations = await this.dataService.getReservations();
      const reservationsToDelete = reservations.filter(
        (res) => res.vehicle === vehicleToDelete.plate
      );

      for (const reservation of reservationsToDelete) {
        await this.dataService.deleteReservation(reservation.id);
      }

      // Now delete the vehicle
      user.cars = user.cars.filter((v) => v.id !== id);
      await this.saveUserData(user);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }
}
