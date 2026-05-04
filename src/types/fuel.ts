export interface FuelLog {
  id: string;
  date: string;
  odometerKm: number;
  litres: number;
  isFullTank: boolean;
  note?: string;
  createdAt: string;
}

export interface FuelLogInput {
  date: string;
  odometerKm: number;
  litres: number;
  isFullTank: boolean;
  note?: string;
}
