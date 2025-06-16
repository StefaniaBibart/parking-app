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

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    ThemeService,

    FirebaseDataService,
    LocalstorageDataService,
    LocalStorageParkingSpotService,

    {
      provide: ParkingSpotService,
      useClass: LocalStorageParkingSpotService,
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
  ],
};
