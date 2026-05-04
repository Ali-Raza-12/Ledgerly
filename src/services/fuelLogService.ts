import { todayISO } from "@/lib/format";
import type { FuelLog, FuelLogInput } from "@/types/fuel";
import { requireUserId } from "./userScope";

const getFuelLogStorageKey = (userId: string) => `fuel-logs:${userId}`;

const normalizeFuelLog = (log: Partial<FuelLog>): FuelLog => ({
  id: typeof log.id === "string" && log.id ? log.id : crypto.randomUUID(),
  date: typeof log.date === "string" && log.date ? log.date : todayISO(),
  odometerKm: typeof log.odometerKm === "number" ? log.odometerKm : 0,
  litres: typeof log.litres === "number" ? log.litres : 0,
  isFullTank: Boolean(log.isFullTank),
  note: typeof log.note === "string" && log.note.trim() ? log.note.trim() : undefined,
  createdAt: typeof log.createdAt === "string" && log.createdAt ? log.createdAt : new Date().toISOString(),
});

const sortFuelLogs = (logs: FuelLog[]) =>
  [...logs].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return b.createdAt.localeCompare(a.createdAt);
  });

const readFuelLogs = (userId: string) => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getFuelLogStorageKey(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return sortFuelLogs(parsed.map((item) => normalizeFuelLog(item)));
  } catch {
    return [];
  }
};

const writeFuelLogs = (userId: string, logs: FuelLog[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getFuelLogStorageKey(userId), JSON.stringify(sortFuelLogs(logs)));
};

export const getFuelLogs = async () => {
  try {
    const userId = await requireUserId();
    return { data: readFuelLogs(userId), error: null };
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
    const nextLog = normalizeFuelLog({
      ...input,
      odometerKm: Number(input.odometerKm),
      litres: Number(input.litres),
    });

    const logs = readFuelLogs(userId);
    writeFuelLogs(userId, [nextLog, ...logs]);

    return { data: [nextLog], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to save fuel log."),
    };
  }
};
