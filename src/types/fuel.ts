export interface FuelLog {
  id: string;
<<<<<<< HEAD
  date: string; // yyyy-mm-dd
  odometer: number;
  fuel_liters: number;
  fuel_cost?: number | null;
  is_full_tank: boolean;
  note?: string | null;
  created_at?: string;
=======
  date: string;
  odometerKm: number;
  litres: number;
  isFullTank: boolean;
  note?: string;
  createdAt: string;
>>>>>>> daf411b (Add fuel average functionality)
}

export interface FuelLogInput {
  date: string;
<<<<<<< HEAD
  odometer: number;
  fuel_liters: number;
  fuel_cost?: number | null;
  is_full_tank: boolean;
  note?: string | null;
}

export interface FuelCycleStat {
  fromDate: string;
  toDate: string;
  fromOdo: number;
  toOdo: number;
  distance: number;
  totalLiters: number;
  totalCost: number;
  averageKmPerL: number;
  costPerKm: number;
=======
  odometerKm: number;
  litres: number;
  isFullTank: boolean;
  note?: string;
>>>>>>> daf411b (Add fuel average functionality)
}
