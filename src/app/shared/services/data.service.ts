import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Reservation {
  id: number;
  date: Date | string;
  spot: string;
  vehicle: string;
}

export interface Vehicle {
  id: number;
  plate: string;
}

export interface User {
  email: string;
  id: string;
  token: string;
  username: string;
  phoneNumber?: string;
  cars?: Vehicle[];
}

@Injectable()
export abstract class DataService {
  protected abstract getData(path: string): Promise<any>;
  protected abstract storeData(path: string, data: any): Promise<void>;
  protected abstract updateData(path: string, data: any): Promise<void>;
  protected abstract deleteData(path: string): Promise<void>;
  protected abstract clearAllData(): Promise<void>;
  
  abstract getReservations(): Promise<Reservation[]>;
  abstract addReservation(reservation: Reservation): Promise<void>;
  abstract updateReservation(reservation: Reservation): Promise<void>;
  abstract deleteReservation(id: number): Promise<void>;
  abstract getUpcomingReservations(): Promise<Reservation[]>;
  abstract getPastReservations(): Promise<Reservation[]>;
  
  abstract storeTemporaryReservationData(data: {
    editingReservationId?: number,
    reservationDate?: string,
    reservationVehicleId?: number
  }): Promise<void>;
  
  abstract getTemporaryReservationData(): Promise<{
    editingReservationId?: number,
    reservationDate?: string,
    reservationVehicleId?: number
  }>;
  
  abstract clearTemporaryReservationData(): Promise<void>;
  
  abstract getUserVehicles(): Promise<Vehicle[]>;
  abstract addVehicle(vehicle: Vehicle): Promise<void>;
  abstract updateVehicle(vehicle: Vehicle): Promise<void>;
  abstract deleteVehicle(id: number): Promise<void>;
  abstract findVehicleByPlate(plate: string): Promise<Vehicle | undefined>;
  
  abstract getCurrentUser(): Promise<User | null>;
  abstract storeUser(user: User): Promise<void>;
  abstract updateUser(user: User): Promise<void>;
  abstract deleteUser(userId: string): Promise<void>;
}