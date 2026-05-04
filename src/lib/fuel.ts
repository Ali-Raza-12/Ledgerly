import type { FuelLog } from "@/types/fuel";

export interface FuelCycle {
  id: string;
  startDate: string;
  endDate: string;
  startOdometerKm: number;
  endOdometerKm: number;
  distanceKm: number;
  litresUsed: number;
  averageKmPerLitre: number;
  logsCount: number;
}

export interface ActiveFuelCycle {
  startDate: string;
  currentDate: string;
  startOdometerKm: number;
  currentOdometerKm: number;
  distanceKm: number;
  litresAdded: number;
  logsCount: number;
}

const sortAscending = (logs: FuelLog[]) =>
  [...logs].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return a.createdAt.localeCompare(b.createdAt);
  });

export const buildFuelCycles = (logs: FuelLog[]) => {
  const ordered = sortAscending(logs);
  const cycles: FuelCycle[] = [];

  let cycleStart: FuelLog | null = null;
  let litresSinceFull = 0;
  let logsSinceFull: FuelLog[] = [];

  for (const log of ordered) {
    if (!cycleStart) {
      if (log.isFullTank) {
        cycleStart = log;
      }
      continue;
    }

    litresSinceFull += log.litres;
    logsSinceFull.push(log);

    if (!log.isFullTank) {
      continue;
    }

    const distanceKm = log.odometerKm - cycleStart.odometerKm;
    if (distanceKm > 0 && litresSinceFull > 0) {
      cycles.push({
        id: `${cycleStart.id}:${log.id}`,
        startDate: cycleStart.date,
        endDate: log.date,
        startOdometerKm: cycleStart.odometerKm,
        endOdometerKm: log.odometerKm,
        distanceKm,
        litresUsed: litresSinceFull,
        averageKmPerLitre: distanceKm / litresSinceFull,
        logsCount: logsSinceFull.length,
      });
    }

    cycleStart = log;
    litresSinceFull = 0;
    logsSinceFull = [];
  }

  let activeCycle: ActiveFuelCycle | null = null;
  if (cycleStart && logsSinceFull.length > 0) {
    const currentLog = logsSinceFull[logsSinceFull.length - 1];
    activeCycle = {
      startDate: cycleStart.date,
      currentDate: currentLog.date,
      startOdometerKm: cycleStart.odometerKm,
      currentOdometerKm: currentLog.odometerKm,
      distanceKm: Math.max(0, currentLog.odometerKm - cycleStart.odometerKm),
      litresAdded: litresSinceFull,
      logsCount: logsSinceFull.length,
    };
  }

  return {
    cycles: cycles.reverse(),
    activeCycle,
  };
};
