import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { tap, catchError, mergeMap } from 'rxjs/operators';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential,
} from 'firebase/auth';
import { DataService } from './data.service';
import { User } from '../models/user.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  user as fireUser,
  signInWithEmailAndPassword,
  authState,
  signOut,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly auth = inject(Auth);
  readonly authState$ = authState(this.auth);

  fireBaseUser = toSignal(this.authState$);

  user = computed(async () => {
    const fireBaseUser = this.fireBaseUser();
    console.log('fireBaseUser', fireBaseUser);

    if (!fireBaseUser || !fireBaseUser.email)
      return null;

    const token = await fireBaseUser.getIdToken();
    const mappedUser: User = {
      email: fireBaseUser.email,
      id: fireBaseUser.uid,
      token: token,
      username: fireBaseUser.displayName ?? '',
      phoneNumber: fireBaseUser.phoneNumber ?? null,
    };

    const existingUser = await this.dataService.getCurrentUser();

    if (existingUser) {
      // DO STUFF
      console.log('existingUser', existingUser);
      localStorage.setItem('userData', JSON.stringify(mappedUser));
      this.dataService.storeUser(mappedUser);
    }

    return mappedUser;
  });

  constructor(private router: Router, private dataService: DataService) {
    this.loadUserFromStorage();
  }

  users$ = this.authState$.pipe(
    mergeMap(async (user) => {
      if (!user || !user.displayName || !user.email) return null;

      const token = await user.getIdToken();
      const mappedUser: User = {
        email: user.email,
        id: user.uid,
        token: token,
        username: user.displayName,
        phoneNumber: user.phoneNumber ?? null,
      };
      return mappedUser;
    })
  );

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
        } else {
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  }

  signup(
    email: string,
    password: string,
    username: string,
    phoneNumber: string
  ): Observable<UserCredential> {
    const auth = getAuth();
    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      tap(async (userCredential) => {
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
            phoneNumber: phoneNumber || null,
          };

          await this.dataService.storeUser(user);

          localStorage.setItem('userData', JSON.stringify(user));
        }
      }),
      catchError((error) => {
        console.error('Signup error:', error);
        throw error;
      })
    );
  }

  // DONE
  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  // DONE
  logout() {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        localStorage.removeItem('userData');
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        console.error('Logout error:', error);
        throw error;
      })
    );
  }

  async updateUserProfile(user: User): Promise<void> {
    try {
      await this.dataService.updateUser(user);

      localStorage.setItem('userData', JSON.stringify(user));
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}
