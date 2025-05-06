import { Injectable } from '@angular/core';
import { DataService, Reservation, Vehicle } from './data.service';
import { getDatabase, ref, get, set, update, remove, query, orderByChild } from 'firebase/database';

@Injectable()
export class FirebaseDataService extends DataService {
  private baseUrl = 'https://parking-app-16597-default-rtdb.europe-west1.firebasedatabase.app/';
  private reservationsPath = 'reservations';
  private tempDataPath = 'tempReservationData';
  private usersPath = 'users';
  
  constructor() {
    super();
  }
  
  async getData(path: string): Promise<any> {
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
  
  async storeData(path: string, data: any): Promise<void> {
    try {
      const db = getDatabase();
      const dataRef = ref(db, path);
      await set(dataRef, data);
    } catch (error) {
      console.error(`Error storing data to Firebase at ${path}:`, error);
      throw error;
    }
  }
  
  async updateData(path: string, data: any): Promise<void> {
    try {
      const db = getDatabase();
      const dataRef = ref(db, path);
      await update(dataRef, data);
    } catch (error) {
      console.error(`Error updating data in Firebase at ${path}:`, error);
      throw error;
    }
  }
  
  async deleteData(path: string): Promise<void> {
    try {
      const db = getDatabase();
      const dataRef = ref(db, path);
      await remove(dataRef);
    } catch (error) {
      console.error(`Error deleting data from Firebase at ${path}:`, error);
      throw error;
    }
  }
  
  async clearAllData(): Promise<void> {
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
      
      const reservationsArray = Array.isArray(data) ? data : Object.values(data);
      
      return reservationsArray.map((res: any) => ({
        ...res,
        date: res.date ? new Date(res.date) : null
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
        date: reservation.date instanceof Date ? reservation.date.toISOString() : reservation.date
      };
      
      await this.storeData(path, reservationToStore);
    } catch (error) {
      console.error('Error adding reservation to Firebase:', error);
      throw error;
    }
  }
  
  async updateReservation(reservation: Reservation): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const path = `${this.reservationsPath}/${userId}/${reservation.id}`;
      
      const reservationToStore = {
        ...reservation,
        date: reservation.date instanceof Date ? reservation.date.toISOString() : reservation.date
      };
      
      await this.storeData(path, reservationToStore);
    } catch (error) {
      console.error('Error updating reservation in Firebase:', error);
      throw error;
    }
  }
  
  async deleteReservation(id: number): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const path = `${this.reservationsPath}/${userId}/${id}`;
      await this.deleteData(path);
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
        .filter(res => new Date(res.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Error getting upcoming reservations from Firebase:', error);
      return [];
    }
  }
  
  async getPastReservations(): Promise<Reservation[]> {
    try {
      const allReservations = await this.getReservations();
      const now = new Date();
      
      return allReservations
        .filter(res => new Date(res.date) < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting past reservations from Firebase:', error);
      return [];
    }
  }
  
  async storeTemporaryReservationData(data: {
    editingReservationId?: number,
    reservationDate?: string,
    reservationVehicleId?: number
  }): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const path = `${this.tempDataPath}/${userId}`;
      
      const existingData = await this.getTemporaryReservationData();
      const updatedData = { ...existingData, ...data };
      
      await this.storeData(path, updatedData);
    } catch (error) {
      console.error('Error storing temporary reservation data in Firebase:', error);
      throw error;
    }
  }
  
  async getTemporaryReservationData(): Promise<{
    editingReservationId?: number,
    reservationDate?: string,
    reservationVehicleId?: number
  }> {
    try {
      const userId = this.getCurrentUserId();
      const path = `${this.tempDataPath}/${userId}`;
      const data = await this.getData(path);
      return data || {};
    } catch (error) {
      console.error('Error getting temporary reservation data from Firebase:', error);
      return {};
    }
  }
  
  async clearTemporaryReservationData(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const path = `${this.tempDataPath}/${userId}`;
      await this.deleteData(path);
    } catch (error) {
      console.error('Error clearing temporary reservation data from Firebase:', error);
      throw error;
    }
  }
  
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
      
      const index = vehicles.findIndex(v => v.id === vehicle.id);
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
      const path = `${this.usersPath}/${userId}/cars`;
      
      const vehicles = await this.getUserVehicles();
      
      const updatedVehicles = vehicles.filter(v => v.id !== id);
      
      await this.storeData(path, updatedVehicles);
    } catch (error) {
      console.error('Error deleting vehicle from Firebase:', error);
      throw error;
    }
  }
  
  async findVehicleByPlate(plate: string): Promise<Vehicle | undefined> {
    try {
      const vehicles = await this.getUserVehicles();
      return vehicles.find(v => v.plate === plate);
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
}