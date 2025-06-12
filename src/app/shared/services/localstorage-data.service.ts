import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Reservation } from '../models/reservation.model';
import { Vehicle } from '../models/vehicle.model';
import { User } from '../models/user.model';

@Injectable()
export class LocalstorageDataService extends DataService {
  private prefix = 'app_data_';
  private reservationsKey = 'userReservations';
  private tempReservationKey = 'temp_reservation_data';
  private allReservationsKey = 'all_reservations';

  constructor() {
    super();
  }

  protected async getData(path: string): Promise<any> {
    try {
      const storageKey = this.getStorageKey(path);
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting data from localStorage at ${path}:`, error);
      throw error;
    }
  }

  protected async storeData(path: string, data: any): Promise<void> {
    try {
      const storageKey = this.getStorageKey(path);
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Error storing data to localStorage at ${path}:`, error);
      throw error;
    }
  }

  protected async updateData(path: string, data: any): Promise<void> {
    try {
      const storageKey = this.getStorageKey(path);
      const existingData = localStorage.getItem(storageKey);
      let updatedData = data;

      if (existingData) {
        updatedData = { ...JSON.parse(existingData), ...data };
      }

      localStorage.setItem(storageKey, JSON.stringify(updatedData));
    } catch (error) {
      console.error(`Error updating data in localStorage at ${path}:`, error);
      throw error;
    }
  }

  protected async deleteData(path: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(path);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Error deleting data from localStorage at ${path}:`, error);
      throw error;
    }
  }

  protected async clearAllData(): Promise<void> {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing all localStorage data:', error);
      throw error;
    }
  }

  private getStorageKey(path: string): string {
    return `${this.prefix}${path.replace(/\//g, '_')}`;
  }

  async getReservations(): Promise<Reservation[]> {
    try {
      const reservationsStr = localStorage.getItem(this.reservationsKey);
      if (!reservationsStr) return [];

      const reservations: Reservation[] = JSON.parse(reservationsStr);

      return reservations.map((res) => ({
        ...res,
        startDate: new Date(res.startDate),
        endDate: new Date(res.endDate),
      }));
    } catch (error) {
      console.error('Error getting reservations from localStorage:', error);
      return [];
    }
  }

  async addReservation(reservation: Reservation): Promise<void> {
    try {
      const reservations = await this.getReservations();
      reservations.push(reservation);
      localStorage.setItem(this.reservationsKey, JSON.stringify(reservations));

      const allReservations = await this.getAllReservations();
      allReservations.push(reservation);
      localStorage.setItem(
        this.allReservationsKey,
        JSON.stringify(allReservations)
      );
    } catch (error) {
      console.error('Error adding reservation to localStorage:', error);
      throw error;
    }
  }

  async updateReservation(reservation: Reservation): Promise<void> {
    try {
      const reservations = await this.getReservations();
      const index = reservations.findIndex((r) => r.id === reservation.id);

      if (index !== -1) {
        reservations[index] = reservation;
        localStorage.setItem(
          this.reservationsKey,
          JSON.stringify(reservations)
        );

        const allReservations = await this.getAllReservations();
        const globalIndex = allReservations.findIndex(
          (r) => r.id === reservation.id
        );

        if (globalIndex !== -1) {
          allReservations[globalIndex] = reservation;
          localStorage.setItem(
            this.allReservationsKey,
            JSON.stringify(allReservations)
          );
        }
      } else {
        throw new Error(`Reservation with id ${reservation.id} not found`);
      }
    } catch (error) {
      console.error('Error updating reservation in localStorage:', error);
      throw error;
    }
  }

  async deleteReservation(id: number): Promise<void> {
    try {
      const reservations = await this.getReservations();
      const filteredReservations = reservations.filter((r) => r.id !== id);
      localStorage.setItem(
        this.reservationsKey,
        JSON.stringify(filteredReservations)
      );

      const allReservations = await this.getAllReservations();
      const filteredAllReservations = allReservations.filter(
        (r) => r.id !== id
      );
      localStorage.setItem(
        this.allReservationsKey,
        JSON.stringify(filteredAllReservations)
      );

      const allUsers = this.getAllStoredUsers();
      for (const userId of allUsers) {
        const userReservationsKey = `${userId}_${this.reservationsKey}`;
        const userReservationsData = localStorage.getItem(userReservationsKey);
        if (userReservationsData) {
          const userReservations = JSON.parse(userReservationsData);
          const filteredUserReservations = userReservations.filter(
            (r: any) => r.id !== id
          );
          localStorage.setItem(
            userReservationsKey,
            JSON.stringify(filteredUserReservations)
          );
        }
      }
    } catch (error) {
      console.error('Error deleting reservation from localStorage:', error);
      throw error;
    }
  }

  private getAllStoredUsers(): string[] {
    const users: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith('_userReservations')) {
        const userId = key.replace('_userReservations', '');
        users.push(userId);
      }
    }
    return users;
  }

  async getUpcomingReservations(): Promise<Reservation[]> {
    try {
      const reservations = await this.getReservations();
      const now = new Date();

      return reservations
        .filter((res) => new Date(res.startDate) >= now)
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
    } catch (error) {
      console.error(
        'Error getting upcoming reservations from localStorage:',
        error
      );
      return [];
    }
  }

  async getPastReservations(): Promise<Reservation[]> {
    try {
      const reservations = await this.getReservations();
      const now = new Date();

      return reservations
        .filter((res) => new Date(res.endDate) < now)
        .sort(
          (a, b) =>
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
        );
    } catch (error) {
      console.error(
        'Error getting past reservations from localStorage:',
        error
      );
      return [];
    }
  }

  async storeTemporaryReservationData(data: {
    editingReservationId?: number;
    reservationStartDate?: string;
    reservationEndDate?: string;
    reservationVehicleId?: number;
  }): Promise<void> {
    try {
      const existingData = await this.getTemporaryReservationData();
      const updatedData = { ...existingData, ...data };
      localStorage.setItem(
        this.tempReservationKey,
        JSON.stringify(updatedData)
      );
    } catch (error) {
      console.error('Error storing temporary reservation data:', error);
      throw error;
    }
  }

  async getTemporaryReservationData(): Promise<{
    editingReservationId?: number;
    reservationStartDate?: string;
    reservationEndDate?: string;
    reservationVehicleId?: number;
  }> {
    try {
      const data = localStorage.getItem(this.tempReservationKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting temporary reservation data:', error);
      return {};
    }
  }

  async clearTemporaryReservationData(): Promise<void> {
    try {
      localStorage.removeItem(this.tempReservationKey);
    } catch (error) {
      console.error('Error clearing temporary reservation data:', error);
      throw error;
    }
  }

  async getUserVehicles(): Promise<Vehicle[]> {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        if (parsedData.cars && Array.isArray(parsedData.cars)) {
          return parsedData.cars.map((car: Vehicle) => ({
            id: car.id,
            plate: car.plate,
          }));
        }
      }
      return [];
    } catch (error) {
      console.error('Error getting user vehicles from localStorage:', error);
      return [];
    }
  }

  async addVehicle(vehicle: Vehicle): Promise<void> {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const cars = user.cars || [];
        cars.push(vehicle);
        user.cars = cars;
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        throw new Error('No user data found in localStorage');
      }
    } catch (error) {
      console.error('Error adding vehicle to localStorage:', error);
      throw error;
    }
  }

  async updateVehicle(vehicle: Vehicle): Promise<void> {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (!user.cars || !Array.isArray(user.cars)) {
          throw new Error('No vehicles found in user data');
        }

        const index = user.cars.findIndex((v: Vehicle) => v.id === vehicle.id);
        if (index === -1) {
          throw new Error(`Vehicle with id ${vehicle.id} not found`);
        }

        user.cars[index] = vehicle;
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        throw new Error('No user data found in localStorage');
      }
    } catch (error) {
      console.error('Error updating vehicle in localStorage:', error);
      throw error;
    }
  }

  async deleteVehicle(id: number): Promise<void> {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (!user.cars || !Array.isArray(user.cars)) {
          throw new Error('No vehicles found in user data');
        }

        const vehicleToDelete = user.cars.find((v: Vehicle) => v.id === id);

        if (!vehicleToDelete) {
          throw new Error(`Vehicle with id ${id} not found`);
        }

        const reservations = await this.getReservations();

        const reservationsToDelete = reservations.filter(
          (res) => res.vehicle === vehicleToDelete.plate
        );

        for (const reservation of reservationsToDelete) {
          await this.deleteReservation(reservation.id);
        }

        user.cars = user.cars.filter((v: Vehicle) => v.id !== id);
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        throw new Error('No user data found in localStorage');
      }
    } catch (error) {
      console.error('Error deleting vehicle from localStorage:', error);
      throw error;
    }
  }

  async findVehicleByPlate(plate: string): Promise<Vehicle | undefined> {
    try {
      const vehicles = await this.getUserVehicles();
      return vehicles.find((v) => v.plate === plate);
    } catch (error) {
      console.error('Error finding vehicle by plate:', error);
      return undefined;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user from localStorage:', error);
      return null;
    }
  }

  async storeUser(user: User): Promise<void> {
    try {
      localStorage.setItem('userData', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user to localStorage:', error);
      throw error;
    }
  }

  async updateUser(user: User): Promise<void> {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const currentUser = JSON.parse(userData);
        const updatedUser = { ...currentUser, ...user };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      } else {
        localStorage.setItem('userData', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error updating user in localStorage:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Error deleting user from localStorage:', error);
      throw error;
    }
  }

  async getAllReservations(): Promise<Reservation[]> {
    try {
      const allReservationsStr = localStorage.getItem(this.allReservationsKey);

      if (!allReservationsStr) {
        const userReservations = await this.getReservations();
        const currentUser = await this.getCurrentUser();
        const username =
          currentUser?.username || currentUser?.email || 'Unknown User';

        const reservationsWithUser = userReservations.map((res) => ({
          ...res,
          user: username,
        }));

        localStorage.setItem(
          this.allReservationsKey,
          JSON.stringify(reservationsWithUser)
        );
        return reservationsWithUser;
      }

      const allReservations: any[] = JSON.parse(allReservationsStr);

      const currentUser = await this.getCurrentUser();
      const username =
        currentUser?.username || currentUser?.email || 'Unknown User';

      return allReservations.map((res) => ({
        ...res,
        user: res.user || username,
        startDate: new Date(res.startDate),
        endDate: new Date(res.endDate),
      }));
    } catch (error) {
      console.error('Error getting all reservations from localStorage:', error);
      return [];
    }
  }
}
