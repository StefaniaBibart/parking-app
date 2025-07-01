import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { tap, catchError, mergeMap, switchMap } from 'rxjs/operators';
import { DataService } from './data.service';
import { User } from '../models/user.model';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import {
  Auth,
  signInWithEmailAndPassword,
  authState,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  readonly authState$ = authState(this.auth);

  authState = toSignal(this.authState$);

  user = computed(async () => {
    const authState = this.authState();

    if (!authState || !authState.email) {
      localStorage.removeItem('userData');
      return null;
    }

    const userFromAuth = await this.mapUser(authState);
    const userFromDb = await this.dataService.getCurrentUser();

    const fullUser: User = {
      ...userFromDb,
      ...userFromAuth,
    };

    localStorage.setItem('userData', JSON.stringify(fullUser));
    return fullUser;
  });


  users$ = this.authState$.pipe(
    mergeMap(async (user) => {
      if (!user) return null;

      return this.mapUser(user);
    })
  );


  constructor(private router: Router, private dataService: DataService) {}

  // WIP
  signup(
    email: string,
    password: string,
    username: string,
    phoneNumber: string
  ): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      tap(async (userCredential) => {
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: username,
          });

          const user: User = await this.mapUser(userCredential.user);
          user.phoneNumber = phoneNumber;

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

  private async mapUser(user: any): Promise<Omit<User, 'phoneNumber'>> {
    const token = await user.getIdToken();
    return {
      email: user.email,
      id: user.uid,
      token,
      username: user.displayName,
    };
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
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser) {
      throw new Error('User not logged in.');
    }

    try {
      await updateProfile(firebaseUser, {
        displayName: user.username,
      });

      await this.dataService.updateUser(user);

      await firebaseUser.getIdToken(true);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}
