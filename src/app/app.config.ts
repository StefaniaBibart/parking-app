import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ThemeService } from './services/theme.service';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment.development';

const firebaseConfig = {
  apiKey: environment.FIREBASE_AUTH_KEY
};

initializeApp(firebaseConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideAnimationsAsync(),
    ThemeService
  ]
};
