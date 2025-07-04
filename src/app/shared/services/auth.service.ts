import { computed, inject, Injectable, signal } from '@angular/core';
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
  User as FirebaseUser,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  readonly authState$ = authState(this.auth);
  readonly authState = toSignal(this.authState$);

  // Base auth user data from authState
  readonly userFromAuth = computed(() => {
    const authState = this.authState();
    if (!authState) {
      return null;
    }
    return this.mapUserFromFirebase(authState);
  });

  // User data from our database
  readonly userFromDb = computed(() => {
    const auth = this.userFromAuth();
    if (!auth) {
      return null;
    }
    return this.dataService.getCurrentUser();
  });

  // Combined user data with proper type checking
  readonly user = computed<User | null>(() => {
    const auth = this.userFromAuth();
    if (!auth) {
      localStorage.removeItem('userData');
      this.router.navigate(['/login']);
      return null;
    }

    const dbUser = this.userFromDb();
    if (!dbUser) {
      // If no DB user exists yet, return just the auth user data
      const baseUser: User = {
        email: auth.email,
        id: auth.id,
        token: auth.token,
        username: auth.username,
      };
      localStorage.setItem('userData', JSON.stringify(baseUser));
      return baseUser;
    }

    // Combine auth and DB data, with auth taking precedence for overlapping fields
    const fullUser: User = {
      ...dbUser,
      ...auth, // Auth data overrides DB data for core fields
    };

    localStorage.setItem('userData', JSON.stringify(fullUser));
    return fullUser;
  });

  // TODO:
  // isAdmin = computed(() =>  this.user().email === ADMIN_CONFIG.adminEmail);

  // TODO: toObservable(this.user)
  user$ = this.authState$.pipe(
    mergeMap(async (user) => {
      if (!user) return null;

      return this.mapUserFromFirebase(user);
    })
  );

  constructor(private router: Router, private dataService: DataService) {}

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
          // TODO: move in computed user
          await updateProfile(userCredential.user, {
            displayName: username,
          });

          const user: User = this.mapUserFromFirebase(userCredential.user);
          user.phoneNumber = phoneNumber;

          await this.dataService.storeUser(user);

          // TODO: move in computed user
        }
      }),
      catchError((error) => {
        console.error('Signup error:', error);
        throw error;
      })
    );
  }

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  logout() {
    return from(signOut(this.auth)).pipe(
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

  private mapUserFromFirebase(firebaseUser: FirebaseUser): Omit<User, 'phoneNumber' | 'cars'> {
    return {
      email: firebaseUser.email!,
      id: firebaseUser.uid,
      token: firebaseUser.refreshToken,
      username: firebaseUser.displayName || '',
    };
  }
}
