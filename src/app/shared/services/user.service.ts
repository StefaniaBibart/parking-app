import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService, Vehicle } from './data.service';

export interface User {
  id: string;
  name: string;
  email: string;
  cars?: Vehicle[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private dataService: DataService) {
    this.loadUserFromStorage();
  }
  
  private loadUserFromStorage() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        
        this.syncUserToFirebase(user);
      } catch (error) {
        console.error('Error parsing user data from storage:', error);
      }
    }
  }
  
  private async syncUserToFirebase(user: User) {
    try {
      await this.dataService.storeData(`users/${user.id}`, user);
    } catch (error) {
      console.error('Error syncing user to Firebase:', error);
    }
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  getCurrentUserId(): string {
    const user = this.getCurrentUser();
    return user?.id || 'anonymous';
  }
  
  async saveUserData(user: User): Promise<void> {
    try {
      localStorage.setItem('userData', JSON.stringify(user));
      
      await this.dataService.storeData(`users/${user.id}`, user);
      
      this.currentUserSubject.next(user);
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
        cars
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
      
      const index = user.cars.findIndex(v => v.id === vehicle.id);
      if (index === -1) throw new Error(`Vehicle with id ${vehicle.id} not found`);
      
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
      
      user.cars = user.cars.filter(v => v.id !== id);
      
      await this.saveUserData(user);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }
} 