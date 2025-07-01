import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { ThemeService } from './services/theme.service';
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
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

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
    
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth())
  ],
};
