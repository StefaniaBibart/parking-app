import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { ThemeService } from './services/theme.service';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment.development';

import { DataService } from './shared/services/data.service';
import { FirebaseDataService } from './shared/services/firebase-data.service';
import { LocalstorageDataService } from './shared/services/localstorage-data.service';
import {
  DataProviderType,
  DataProviderService,
} from './shared/services/data-provider.service';
import { DataServiceFactory } from './shared/services/data-service-factory';
import { ParkingSpotService } from './shared/services/parking-spot.service';
import { LocalStorageParkingSpotService } from './shared/services/localstorage-parking-spot.service';
import { FirebaseParkingSpotService } from './shared/services/firebase-parking-spot.service';
import {
  initializeApp as initializeApp_alias,
  provideFirebaseApp,
} from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: environment.FIREBASE_AUTH_KEY,
  databaseURL:
    'https://parking-app-16597-default-rtdb.europe-west1.firebasedatabase.app/',
};

try {
  initializeApp(firebaseConfig);
} catch (e) {
  console.error('Firebase initialization error:', e);
}

const DEFAULT_DATA_PROVIDER = DataProviderType.FIREBASE;
const PARKING_SPOT_PROVIDER = DataProviderType.FIREBASE; // or DataProviderType.LOCALSTORAGE

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    ThemeService,

    FirebaseDataService,
    LocalstorageDataService,
    LocalStorageParkingSpotService,
    FirebaseParkingSpotService,

    {
      provide: ParkingSpotService,
      useFactory: (
        localStorageService: LocalStorageParkingSpotService,
        firebaseService: FirebaseParkingSpotService
      ) => {
        if (PARKING_SPOT_PROVIDER === DataProviderType.FIREBASE) {
          return firebaseService;
        }
        return localStorageService;
      },
      deps: [LocalStorageParkingSpotService, FirebaseParkingSpotService],
    },

    {
      provide: DataProviderService,
      useFactory: () => {
        const service = new DataProviderService();
        service.setProvider(DEFAULT_DATA_PROVIDER);
        return service;
      },
    },

    DataServiceFactory,

    {
      provide: DataService,
      useFactory: (factory: DataServiceFactory) => {
        return factory.getCurrentService();
      },
      deps: [DataServiceFactory],
    },
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'parking-app-16597',
        appId: '1:1050487202550:web:8bd92aff6274dc029902d7',
        databaseURL:
          'https://parking-app-16597-default-rtdb.europe-west1.firebasedatabase.app',
        storageBucket: 'parking-app-16597.firebasestorage.app',
        apiKey: 'AIzaSyB9peE6Hg6j3mUM72h8y9dowfQm0l4LdLc',
        authDomain: 'parking-app-16597.firebaseapp.com',
        messagingSenderId: '1050487202550',
        measurementId: 'G-17KJXQ5T1B',
      })
    ),
    provideAuth(() => getAuth()),
  ],
};
