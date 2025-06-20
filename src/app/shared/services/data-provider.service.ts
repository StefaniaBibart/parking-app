import { Injectable, signal } from '@angular/core';

export enum DataProviderType {
  FIREBASE = 'firebase',
  LOCALSTORAGE = 'localstorage',
}

@Injectable({
  providedIn: 'root',
})
export class DataProviderService {
  private providerType = signal<DataProviderType>(DataProviderType.FIREBASE);

  providerChanged = this.providerType.asReadonly();

  setProvider(type: DataProviderType) {
    this.providerType.set(type);
  }

  getProviderType(): DataProviderType {
    return this.providerType();
  }
}
