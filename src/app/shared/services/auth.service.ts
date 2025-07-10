import {
  computed,
  effect,
  inject,
  Injectable,
  resource,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { tap, catchError, mergeMap, switchMap, filter } from 'rxjs/operators';
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
import { ADMIN_CONFIG } from '../config/admin.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  readonly authState$ = authState(this.auth);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);

  authState = toSignal(this.authState$);

  userResource = resource({
    params: () => this.authState(),
    loader: async ({ params: authState }) => {
      if (!authState) {
        return null;
      }

      // TODO: check if user is in db or is a new user
      const userFromAuth = await this.mapUser(authState);
      const userFromDb = await this.dataService.getCurrentUser();

      const fullUser: User = {
        ...userFromDb,
        ...userFromAuth,
      };

      return fullUser;
    },
  });

  user = computed(() => this.userResource.value());

  isLoading = computed(() => {
    const status = this.userResource.status();
    // TODO: check if idle is needed
    return status === 'loading' || status === 'reloading' || status === 'idle';
  });

  isAdmin = computed(() => {
    if (this.isLoading()) {
      return null;
    }

    const currentUser = this.user();
    if (!currentUser) {
      return false;
    }
    
    const isAdmin = currentUser.email === ADMIN_CONFIG.adminEmail;
    return isAdmin;
  });

  isAdmin$ = toObservable(this.isAdmin).pipe(
    filter(isAdmin => isAdmin !== null)
  );
 
  // TODO: create new user in db in a separate effect
  constructor() {
    effect(() => {
      const status = this.userResource.status();

      if (status === 'loading' || status === 'reloading') {
        return;
      }

      const currentUser = this.userResource.value();

      if (currentUser) {
        localStorage.setItem('userData', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('userData');
      }
    });

    effect(() => {
      const currentUser = this.userResource.value();
      if (currentUser) {
        if (this.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      }
    });
  }

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

          const user: User = await this.mapUser(userCredential.user);
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

  private async mapUser(user: any): Promise<Omit<User, 'phoneNumber'>> {
    const token = await user.getIdToken();
    return {
      email: user.email,
      id: user.uid,
      token,
      username: user.displayName,
    };
  }
}
