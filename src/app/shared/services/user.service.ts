import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService, User, Vehicle } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private dataService: DataService) {
    this.loadUserFromStorage();
  }
  
  private async loadUserFromStorage() {
    try {
      const user = await this.dataService.getCurrentUser();
      if (user) {
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
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
      await this.dataService.updateUser(user);
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