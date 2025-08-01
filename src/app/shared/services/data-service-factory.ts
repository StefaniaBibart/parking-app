import { Injectable, inject } from '@angular/core';
import { DataService } from './data.service';
import { FirebaseDataService } from './firebase-data.service';
import { LocalstorageDataService } from './localstorage-data.service';
import { DataProviderService, DataProviderType } from './data-provider.service';

@Injectable({
  providedIn: 'root',
})
export class DataServiceFactory {
  private currentService: DataService;

  private readonly firebaseService = inject(FirebaseDataService);
  private readonly localStorageService = inject(LocalstorageDataService);
  private readonly providerService = inject(DataProviderService);

  constructor() {
    this.currentService = this.getServiceForProvider(
      this.providerService.getProviderType()
    );

    this.providerService.providerChanged$.subscribe((providerType) => {
      this.currentService = this.getServiceForProvider(providerType);
    });
  }

  getCurrentService(): DataService {
    return this.currentService;
  }

  private getServiceForProvider(providerType: DataProviderType): DataService {
    switch (providerType) {
      case DataProviderType.FIREBASE:
        return this.firebaseService;
      case DataProviderType.LOCALSTORAGE:
        return this.localStorageService;
      default:
        return this.firebaseService;
    }
  }
}
