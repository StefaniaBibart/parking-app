export interface Reservation {
  id: number;
  startDate: Date | string;
  endDate: Date | string;
  spot: string;
  vehicle: string;
  userId?: string;
  user?: string;
}
