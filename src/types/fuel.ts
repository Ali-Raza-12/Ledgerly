export interface FuelLog {
  id: string;
  date: string; // yyyy-mm-dd
  odometer: number;
  fuel_liters: number;
  fuel_cost?: number | null;
  is_full_tank: boolean;
  note?: string | null;
  created_at?: string;
}

export interface FuelLogInput {
  date: string;
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
}
