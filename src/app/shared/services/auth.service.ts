import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { DataService } from './data.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user = this.userSubject.asObservable();
  
  constructor(
    private router: Router,
    private dataService: DataService
  ) {
    this.loadUserFromStorage();
  }

  private async loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const authData = JSON.parse(userData);
        
        const user = await this.dataService.getCurrentUser();
        
        this.userSubject.next(user || authData);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  }

  signup(email: string, password: string, username: string, phoneNumber: string): Observable<UserCredential> {
    const auth = getAuth();
    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      tap(async (userCredential) => {
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: username
          });
          
          const token = await userCredential.user.getIdToken();
          
          const user: User = {
            email: email,
            id: userCredential.user.uid,
            token: token,
            username: username,
            phoneNumber: phoneNumber
          };
          
          await this.dataService.storeUser(user);
          
          localStorage.setItem('userData', JSON.stringify(user));
          
          this.userSubject.next(user);
        }
      }),
      catchError(error => {
        console.error('Signup error:', error);
        throw error;
      })
    );
  }

  login(email: string, password: string): Observable<UserCredential> {
    const auth = getAuth();
    return from(signInWithEmailAndPassword(auth, email, password)).pipe(
      tap(async (userCredential) => {
        if (userCredential.user) {
          const token = await userCredential.user.getIdToken();
          
          const existingUser = await this.dataService.getCurrentUser();
          
          const authData = {
            email: userCredential.user.email || '',
            id: userCredential.user.uid,
            token: token,
            username: userCredential.user.displayName || ''
          };
          
          localStorage.setItem('userData', JSON.stringify(authData));
          
          if (existingUser) {
            const updatedUser = {
              ...existingUser,
              token: token,
              email: userCredential.user.email || existingUser.email,
              username: userCredential.user.displayName || existingUser.username
            };
            
            await this.dataService.updateUser(updatedUser);
            this.userSubject.next(updatedUser);
          } else {
            await this.dataService.storeUser(authData);
            this.userSubject.next(authData);
          }
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  logout() {
    const auth = getAuth();
    signOut(auth).then(async () => {
      this.userSubject.next(null);
      
      localStorage.removeItem('userData');
      
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Logout error:', error);
    });
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  async updateUserProfile(user: User): Promise<void> {
    try {
      await this.dataService.updateUser(user);
      
      localStorage.setItem('userData', JSON.stringify(user));
      
      this.userSubject.next(user);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}
