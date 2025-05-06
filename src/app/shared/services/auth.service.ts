import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';

export interface User {
  email: string;
  id: string;
  token: string;
  username: string;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user = this.userSubject.asObservable();
  
  constructor(private router: Router) {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      this.userSubject.next(parsedUser);
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
          
          this.userSubject.next(user);
          localStorage.setItem('userData', JSON.stringify(user));
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
          
          let phoneNumber = '';
          const storedUserData = localStorage.getItem('userData');
          if (storedUserData) {
            const parsedData = JSON.parse(storedUserData);
            if (parsedData.email === userCredential.user.email) {
              phoneNumber = parsedData.phoneNumber || '';
            }
          }
          
          const user: User = {
            email: userCredential.user.email || '',
            id: userCredential.user.uid,
            token: token,
            username: userCredential.user.displayName || '',
            phoneNumber: phoneNumber
          };
          
          this.userSubject.next(user);
          localStorage.setItem('userData', JSON.stringify(user));
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  logout(): void {
    const auth = getAuth();
    signOut(auth).then(() => {
      this.userSubject.next(null);
      localStorage.removeItem('userData');
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Logout error:', error);
    });
  }

  isAuthenticated(): Observable<boolean> {
    return this.user.pipe(
      map(user => !!user)
    );
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  async updateUserProfile(user: User): Promise<void> {
    try {
      localStorage.setItem('userData', JSON.stringify(user));
      
      this.userSubject.next(user);
      
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}
