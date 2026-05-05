import { monthKey, todayISO } from "@/lib/format";
import { supabase } from "@/lib/supabaseClient";
import type { FuelLog, FuelLogInput } from "@/types/fuel";
import { mapUserScopeError, requireUserId } from "./userScope";

interface FuelLogRow {
  id: string;
  date: string;
  odometerKm?: number | null;
  odometer_km?: number | null;
  litres?: number | null;
  fuel_liters?: number | null;
  fuelCost?: number | null;
  fuel_cost?: number | null;
  isFullTank?: boolean | null;
  is_full_tank?: boolean | null;
  note?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
}

const normalizeFuelLog = (log: FuelLogRow): FuelLog => ({
  id: typeof log.id === "string" && log.id ? log.id : crypto.randomUUID(),
  date: typeof log.date === "string" && log.date ? log.date : todayISO(),
  odometerKm: Number(log.odometerKm ?? log.odometer_km ?? 0),
  litres: Number(log.litres ?? log.fuel_liters ?? 0),
  fuelCost: Number(log.fuelCost ?? log.fuel_cost ?? 0),
  isFullTank: Boolean(log.isFullTank ?? log.is_full_tank),
  note: typeof log.note === "string" && log.note.trim() ? log.note.trim() : undefined,
  createdAt:
    typeof (log.createdAt ?? log.created_at) === "string" && (log.createdAt ?? log.created_at)
      ? (log.createdAt ?? log.created_at)!
      : new Date().toISOString(),
});

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
      data: data?.map((item) => normalizeFuelLog(item as FuelLogRow)) ?? null,
      error: mapUserScopeError(error),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to load fuel history."),
    };
  }
};

export const addFuelLog = async (input: FuelLogInput) => {
  try {
    const userId = await requireUserId();
    const note = input.note?.trim() || null;
    const fuelLogId = crypto.randomUUID();

    const fuelLogPayload = {
      id: fuelLogId,
      user_id: userId,
      date: input.date,
      odometer_km: Number(input.odometerKm),
      fuel_liters: Number(input.litres),
      fuel_cost: Number(input.fuelCost),
      is_full_tank: input.isFullTank,
      note,
    };

    const { data: insertedFuelLog, error: fuelError } = await supabase
      .from("vehicle_fuel_logs")
      .insert([fuelLogPayload])
      .select()
      .single();

    if (fuelError) {
      return {
        data: null,
        error: mapUserScopeError(fuelError),
      };
    }

    const expensePayload = {
      user_id: userId,
      title: input.isFullTank ? "Full tank fuel" : "Fuel top-up",
      amount: Number(input.fuelCost),
      category: "bike",
      type: "bike" as const,
      bike_sub_type: "petrol" as const,
      date: input.date,
      month: monthKey(input.date),
      note,
    };

    const { error: expenseError } = await supabase
      .from("expenses")
      .insert([expensePayload]);

    if (expenseError) {
      await supabase
        .from("vehicle_fuel_logs")
        .delete()
        .eq("id", fuelLogId)
        .eq("user_id", userId);

      return {
        data: null,
        error: mapUserScopeError(expenseError),
      };
    }

    return {
      data: [normalizeFuelLog(insertedFuelLog as FuelLogRow)],
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to save fuel log."),
    };
  }
};
