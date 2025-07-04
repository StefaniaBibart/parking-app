import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Reservation } from '../models/reservation.model';
import { Vehicle } from '../models/vehicle.model';
import { User } from '../models/user.model';
import { getDatabase, ref, get, set, update, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';

@Injectable()
export class FirebaseDataService extends DataService {
  private reservationsPath = 'reservations';
  private tempDataPath = 'temp_reservation_data';
  private usersPath = 'users';

  constructor() {
    super();
  }

  protected async getData(path: string): Promise<any> {
    try {
      const db = getDatabase();
      const dataRef = ref(db, path);
      const snapshot = await get(dataRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(`Error getting data from Firebase at ${path}:`, error);
      throw error;
    }
  }

  protected async storeData(path: string, data: any): Promise<void> {
    try {
      const db = getDatabase();
      const dataRef = ref(db, path);
      await set(dataRef, data);
    } catch (error) {
      console.error(`Error storing data to Firebase at ${path}:`, error);
      throw error;
    }
  }

  protected async updateData(path: string, data: any): Promise<void> {
    try {
      const db = getDatabase();
      const dataRef = ref(db, path);
      await update(dataRef, data);
    } catch (error) {
      console.error(`Error updating data in Firebase at ${path}:`, error);
      throw error;
    }
  }

  protected async deleteData(path: string): Promise<void> {
    try {
      const db = getDatabase();
      const dataRef = ref(db, path);
      await remove(dataRef);
    } catch (error) {
      console.error(`Error deleting data from Firebase at ${path}:`, error);
      throw error;
    }
  }

  protected async clearAllData(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await this.deleteData(`${this.reservationsPath}/${userId}`);
      await this.deleteData(`${this.tempDataPath}/${userId}`);
    } catch (error) {
      console.error('Error clearing all data from Firebase:', error);
      throw error;
    }
  }

  async getReservations(): Promise<Reservation[]> {
    try {
      const userId = this.getCurrentUserId();
      const path = `${this.reservationsPath}/${userId}`;
      const data = await this.getData(path);

      if (!data) return [];

      const reservationsArray = Array.isArray(data)
        ? data
        : Object.values(data);

      return reservationsArray.map((res: any) => ({
        ...res,
        startDate: res.startDate ? new Date(res.startDate) : null,
        endDate: res.endDate ? new Date(res.endDate) : null,
      }));
    } catch (error) {
      console.error('Error getting reservations from Firebase:', error);
      return [];
    }
  }

  async addReservation(reservation: Reservation): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const path = `${this.reservationsPath}/${userId}/${reservation.id}`;

      const reservationToStore = {
        ...reservation,
        startDate:
          reservation.startDate instanceof Date
            ? reservation.startDate.toLocaleString()
            : reservation.startDate,
        endDate:
          reservation.endDate instanceof Date
            ? reservation.endDate.toLocaleString()
            : reservation.endDate,
        userId: userId,
      };

      await this.storeData(path, reservationToStore);
    } catch (error) {
      console.error('Error adding reservation to Firebase:', error);
      throw error;
    }
  }

  async updateReservation(reservation: Reservation): Promise<void> {
    try {
      const userId = reservation.userId
        ? reservation.userId
        : this.getCurrentUserId();
      const path = `${this.reservationsPath}/${userId}/${reservation.id}`;

      const reservationToStore = {
        ...reservation,
        startDate:
          reservation.startDate instanceof Date
            ? reservation.startDate.toLocaleString()
            : reservation.startDate,
        endDate:
          reservation.endDate instanceof Date
            ? reservation.endDate.toLocaleString()
            : reservation.endDate,
      };

      await this.storeData(path, reservationToStore);
    } catch (error: any) {
      console.error('Error updating reservation in Firebase:', error);
      throw error;
    }
  }

  async deleteReservation(id: number): Promise<void> {
    try {
      const allReservations = await this.getAllReservations();
      const reservationToDelete = allReservations.find((r) => r.id === id);

      if (!reservationToDelete) {
        throw new Error(`Reservation with id ${id} not found`);
      }

      const usersSnapshot = await this.getData(this.usersPath);
      if (usersSnapshot) {
        for (const userId in usersSnapshot) {
          const userReservationsPath = `${this.reservationsPath}/${userId}/${id}`;
          try {
            await this.deleteData(userReservationsPath);
            break;
          } catch (error) {
            continue;
          }
        }
      }
    } catch (error) {
      console.error('Error deleting reservation from Firebase:', error);
      throw error;
    }
  }

  async getUpcomingReservations(): Promise<Reservation[]> {
    try {
      const allReservations = await this.getReservations();
      const now = new Date();

      return allReservations
        .filter((res) => new Date(res.startDate) >= now)
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
    } catch (error) {
      console.error(
        'Error getting upcoming reservations from Firebase:',
        error
      );
      return [];
    }
  }

  async getPastReservations(): Promise<Reservation[]> {
    try {
      const allReservations = await this.getReservations();
      const now = new Date();

      return allReservations
        .filter((res) => new Date(res.endDate) < now)
        .sort(
          (a, b) =>
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
        );
    } catch (error) {
      console.error('Error getting past reservations from Firebase:', error);
      return [];
    }
  }

  async getReservationById(id: number): Promise<Reservation | undefined> {
    const reservations = await this.getAllReservations();
    return reservations.find((reservation) => reservation.id === id);
  }

  async storeTemporaryReservationData(data: {
    editingReservationId?: number;
    reservationStartDate?: string;
    reservationEndDate?: string;
    reservationVehicleId?: number;
  }): Promise<void> {}

  async getTemporaryReservationData(): Promise<{
    editingReservationId?: number;
    reservationStartDate?: string;
    reservationEndDate?: string;
    reservationVehicleId?: number;
  }> {
    return {};
  }

  async clearTemporaryReservationData(): Promise<void> {}

  async getUserVehicles(): Promise<Vehicle[]> {
    try {
      const userId = this.getCurrentUserId();
      const path = `${this.usersPath}/${userId}/cars`;
      const data = await this.getData(path);

      if (!data) {
        return [];
      }

      return Array.isArray(data) ? data : Object.values(data);
    } catch (error) {
      console.error('Error getting user vehicles from Firebase:', error);
      return [];
    }
  }

  async getUserVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    try {
      const path = `${this.usersPath}/${userId}/cars`;
      const data = await this.getData(path);

      if (!data) {
        return [];
      }

      return Array.isArray(data) ? data : Object.values(data);
    } catch (error) {
      console.error('Error getting user vehicles from Firebase:', error);
      return [];
    }
  }

  async addVehicle(vehicle: Vehicle): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const path = `${this.usersPath}/${userId}/cars`;

      const vehicles = await this.getUserVehicles();

      vehicles.push(vehicle);

      await this.storeData(path, vehicles);
    } catch (error) {
      console.error('Error adding vehicle to Firebase:', error);
      throw error;
    }
  }

  async updateVehicle(vehicle: Vehicle): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const path = `${this.usersPath}/${userId}/cars`;

      const vehicles = await this.getUserVehicles();

      const index = vehicles.findIndex((v) => v.id === vehicle.id);
      if (index === -1) {
        throw new Error(`Vehicle with id ${vehicle.id} not found`);
      }

      vehicles[index] = vehicle;

      await this.storeData(path, vehicles);
    } catch (error) {
      console.error('Error updating vehicle in Firebase:', error);
      throw error;
    }
  }

  async deleteVehicle(id: number): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const vehiclePath = `${this.usersPath}/${userId}/cars`;

      const vehicles = await this.getUserVehicles();
      const vehicleToDelete = vehicles.find((v) => v.id === id);

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

      const updatedVehicles = vehicles.filter((v) => v.id !== id);
      await this.storeData(vehiclePath, updatedVehicles);
    } catch (error) {
      console.error('Error deleting vehicle from Firebase:', error);
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

  private getCurrentUserId(): string {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || 'anonymous';
    }
    return 'anonymous';
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userId = currentUser.uid;
        const path = `${this.usersPath}/${userId}`;
        return await this.getData(path);
      }

      return null;
    } catch (error) {
      console.error('Error getting current user from Firebase:', error);
      return null;
    }
  }

  async storeUser(user: User): Promise<void> {
    try {
      const path = `${this.usersPath}/${user.id}`;
      await this.storeData(path, user);
    } catch (error) {
      console.error('Error storing user to Firebase:', error);
      throw error;
    }
  }

  async updateUser(user: User): Promise<void> {
    try {
      const path = `${this.usersPath}/${user.id}`;
      await this.updateData(path, user);
    } catch (error) {
      console.error('Error updating user in Firebase:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const path = `${this.usersPath}/${userId}`;
      await this.deleteData(path);
    } catch (error) {
      console.error('Error deleting user from Firebase:', error);
      throw error;
    }
  }

  async getAllReservations(): Promise<Reservation[]> {
    try {
      const allReservations: Reservation[] = [];
      const usersSnapshot = await this.getData(this.usersPath);

      if (usersSnapshot) {
        for (const userId in usersSnapshot) {
          const userReservationsPath = `${this.reservationsPath}/${userId}`;
          const userReservationsSnapshot = await this.getData(
            userReservationsPath
          );

          if (userReservationsSnapshot) {
            const reservations = Array.isArray(userReservationsSnapshot)
              ? userReservationsSnapshot
              : Object.values(userReservationsSnapshot);

            const user = usersSnapshot[userId];

            reservations.forEach((res: any) => {
              if (res) {
                allReservations.push({
                  ...res,
                  startDate: res.startDate ? new Date(res.startDate) : null,
                  endDate: res.endDate ? new Date(res.endDate) : null,
                  userId: userId,
                  user: user ? user.username : 'Unknown',
                });
              }
            });
          }
        }
      }

      return allReservations;
    } catch (error) {
      console.error('Error getting all reservations from Firebase:', error);
      return [];
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const path = this.usersPath;
      const data = await this.getData(path);

      if (!data) return [];

      const allUsers: User[] = [];

      const usersData = await this.getData(this.usersPath);

      Object.keys(data).forEach((userId) => {
        const user = usersData?.[userId];
        if (user) {
          allUsers.push(user);
        }
      });

      return allUsers;
    } catch (error) {
      console.error('Error getting all users from Firebase:', error);
      return [];
    }
  }
}
