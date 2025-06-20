import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential,
} from 'firebase/auth';
import { DataService } from './data.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = signal<User | null>(null);
  user = this.userSubject.asReadonly();

  constructor(private router: Router, private dataService: DataService) {
    this.loadUserFromStorage();
  }

  private async loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const authData = JSON.parse(userData);

        const user = await this.dataService.getCurrentUser();

        if (user) {
          const completeUser = {
            ...user,
            token: authData.token,
          };
          localStorage.setItem('userData', JSON.stringify(completeUser));
          this.userSubject.set(completeUser);
        } else {
          this.userSubject.set(authData);
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  }

  async signup(
    email: string,
    password: string,
    username: string,
    phoneNumber: string
  ): Promise<UserCredential> {
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: username,
        });

        const token = await userCredential.user.getIdToken();

        const user: User = {
          email: email,
          id: userCredential.user.uid,
          token: token,
          username: username,
          phoneNumber: phoneNumber,
        };

        await this.dataService.storeUser(user);
        localStorage.setItem('userData', JSON.stringify(user));
        this.userSubject.set(user);
      }
      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<UserCredential> {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        const token = await userCredential.user.getIdToken();
        const existingUser = await this.dataService.getCurrentUser();

        if (existingUser) {
          const updatedUser = {
            ...existingUser,
            token: token,
            email: userCredential.user.email || existingUser.email,
            username: userCredential.user.displayName || existingUser.username,
            phoneNumber: existingUser.phoneNumber,
          };

          localStorage.setItem('userData', JSON.stringify(updatedUser));
          await this.dataService.updateUser(updatedUser);
          this.userSubject.set(updatedUser);
        } else {
          const authData = {
            email: userCredential.user.email || '',
            id: userCredential.user.uid,
            token: token,
            username: userCredential.user.displayName || '',
          };

          localStorage.setItem('userData', JSON.stringify(authData));
          await this.dataService.storeUser(authData);
          this.userSubject.set(authData);
        }
      }
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout() {
    const auth = getAuth();
    signOut(auth)
      .then(async () => {
        this.userSubject.set(null);
        localStorage.removeItem('userData');
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  }

  getCurrentUser(): User | null {
    return this.userSubject();
  }

  async updateUserProfile(user: User): Promise<void> {
    try {
      await this.dataService.updateUser(user);
      localStorage.setItem('userData', JSON.stringify(user));
      this.userSubject.set(user);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}
