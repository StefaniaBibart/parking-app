import { Vehicle } from './vehicle.model';

export interface User {
  email: string;
  id: string;
  token: string;
  username: string;
  phoneNumber?: string;
  cars?: Vehicle[];
} 