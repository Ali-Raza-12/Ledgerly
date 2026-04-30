import { supabase } from "@/lib/supabaseClient";
import { mapUserScopeError, requireUserId } from "./userScope";
import type { FuelLog, FuelLogInput, FuelCycleStat } from "@/types/fuel";

export const getFuelLogs = async () => {
  try {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from("vehicle_fuel_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    return {
      data: (data as FuelLog[] | null) ?? null,
      error: mapUserScopeError(error),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to load fuel logs."),
    };
  }
};

export const addFuelLog = async (input: FuelLogInput) => {
  try {
    const userId = await requireUserId();
    const payload = { ...input, user_id: userId };
    const { data, error } = await supabase
      .from("vehicle_fuel_logs")
      .insert([payload])
      .select();

    return {
      data: (data as FuelLog[] | null) ?? null,
      error: mapUserScopeError(error),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to save fuel log."),
    };
  }
};

export const deleteFuelLog = async (id: string) => {
  try {
    const userId = await requireUserId();
    const { error } = await supabase
      .from("vehicle_fuel_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    return { error: mapUserScopeError(error) };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Failed to delete fuel log.") };
  }
};

/**
 * Compute fuel cycle stats. A "cycle" is the span between two consecutive
 * full-tank entries. All partial fills in between contribute to total liters.
 * Distance = endOdometer - startOdometer.
 * Average = distance / totalLitersBetween (excluding the starting full tank,
 * including all fills up to and including the ending full tank).
 */
export const computeFuelCycles = (logs: FuelLog[]): FuelCycleStat[] => {
  // sort ascending by date+odometer
  const sorted = [...logs].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.odometer - b.odometer;
  });

  const fullTankIndices = sorted
    .map((l, i) => (l.is_full_tank ? i : -1))
    .filter((i) => i >= 0);

  const cycles: FuelCycleStat[] = [];

  for (let k = 0; k < fullTankIndices.length - 1; k++) {
    const startIdx = fullTankIndices[k];
    const endIdx = fullTankIndices[k + 1];
    const start = sorted[startIdx];
    const end = sorted[endIdx];

    const distance = end.odometer - start.odometer;
    if (distance <= 0) continue;

    let totalLiters = 0;
    let totalCost = 0;
    // include all fills AFTER the start full tank, up to and including end
    for (let i = startIdx + 1; i <= endIdx; i++) {
      totalLiters += Number(sorted[i].fuel_liters) || 0;
      totalCost += Number(sorted[i].fuel_cost) || 0;
    }

    if (totalLiters <= 0) continue;

    cycles.push({
      fromDate: start.date,
      toDate: end.date,
      fromOdo: start.odometer,
      toOdo: end.odometer,
      distance,
      totalLiters,
      totalCost,
      averageKmPerL: distance / totalLiters,
      costPerKm: totalCost > 0 ? totalCost / distance : 0,
    });
  }

  return cycles;
};
